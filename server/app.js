const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const pool = require("./db");
const { readSession, setSession, clearSession } = require("./session");

const app = express();
app.use(express.json());

// Same-origin deployments need no CORS; set FRONTEND_ORIGIN (comma-separated)
// if the frontend is hosted elsewhere.
if (process.env.FRONTEND_ORIGIN) {
  app.use(
    cors({
      origin: process.env.FRONTEND_ORIGIN.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
}

// ---------- serializers (match the old ActiveModel::Serializer output) ----------

const serializeUser = (u) => ({ id: u.id, username: u.username });
const serializePokemon = (p) => ({
  id: p.id,
  name: p.name,
  type_one: p.type_one,
  type_two: p.type_two,
  image: p.image,
  official_image: p.official_image,
  hp: p.hp,
  attack: p.attack,
  defense: p.defense,
  special_attack: p.special_attack,
  special_defense: p.special_defense,
  speed: p.speed,
});
const serializeFavorite = (f) => ({
  id: f.id,
  user: { id: f.user_id, username: f.username },
  pokemon: serializePokemon({
    id: f.pokemon_id,
    name: f.pokemon_name,
    type_one: f.type_one,
    type_two: f.type_two,
    image: f.image,
    official_image: f.official_image,
    hp: f.hp,
    attack: f.attack,
    defense: f.defense,
    special_attack: f.special_attack,
    special_defense: f.special_defense,
    speed: f.speed,
  }),
});

const FAVORITE_SELECT = `
  SELECT f.id, f.user_id, u.username, f.pokemon_id,
         p.name AS pokemon_name, p.type_one, p.type_two, p.image, p.official_image,
         p.hp, p.attack, p.defense, p.special_attack, p.special_defense, p.speed
  FROM user_favorites f
  JOIN users u ON u.id = f.user_id
  JOIN pokemons p ON p.id = f.pokemon_id`;

// ---------- helpers ----------

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function authorize(req, res, next) {
  const session = readSession(req);
  if (session) {
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [session.user_id]);
    if (rows[0]) {
      req.currentUser = rows[0];
      return next();
    }
  }
  res.status(401).json({ errors: ["Not authorized"] });
}

const auth = wrap(authorize);

const api = express.Router();
app.use("/api/v1", api);

// ---------- auth ----------

api.post(
  "/signup",
  wrap(async (req, res) => {
    const { username, password, password_confirmation } = req.body || {};
    const errors = [];
    if (!username) errors.push("Username can't be blank");
    if (!password) errors.push("Password can't be blank");
    if (password_confirmation !== undefined && password !== password_confirmation)
      errors.push("Password confirmation doesn't match Password");
    if (username) {
      const { rows } = await pool.query("SELECT id FROM users WHERE username = $1", [username]);
      if (rows[0]) errors.push("Username has already been taken");
    }
    if (errors.length) return res.status(422).json({ errors });

    const digest = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
      "INSERT INTO users (username, password_digest) VALUES ($1, $2) RETURNING *",
      [username, digest]
    );
    const user = rows[0];
    setSession(res, user.id);
    res.status(201).json(serializeUser(user));
  })
);

api.post(
  "/login",
  wrap(async (req, res) => {
    const { username, password } = req.body || {};
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = rows[0];
    if (user && password && (await bcrypt.compare(password, user.password_digest))) {
      setSession(res, user.id);
      res.status(201).json(serializeUser(user));
    } else {
      res.status(401).json({ errors: ["Invalid username or password"] });
    }
  })
);

api.delete("/logout", auth, (req, res) => {
  clearSession(res);
  res.status(204).end();
});

api.get("/me", auth, (req, res) => {
  res.json(serializeUser(req.currentUser));
});

// ---------- pokemon (public: the frontend loads the pokedex before login) ----------

api.get(
  "/pokemons",
  wrap(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM pokemons ORDER BY id");
    res.json(rows.map(serializePokemon));
  })
);

api.get(
  "/pokemons/:id",
  wrap(async (req, res) => {
    const { rows } = await pool.query("SELECT * FROM pokemons WHERE id = $1", [req.params.id]);
    if (!rows[0]) return res.status(404).json({ errors: ["Pokemon not found"] });
    res.json(serializePokemon(rows[0]));
  })
);

// ---------- user favorites ----------

api.get(
  "/user_favorites",
  auth,
  wrap(async (req, res) => {
    const { rows } = await pool.query(`${FAVORITE_SELECT} WHERE f.user_id = $1 ORDER BY f.id`, [
      req.currentUser.id,
    ]);
    res.json(rows.map(serializeFavorite));
  })
);

api.get(
  "/user_favorites/:id",
  auth,
  wrap(async (req, res) => {
    const { rows } = await pool.query(
      `${FAVORITE_SELECT} WHERE f.user_id = $1 AND f.id = $2`,
      [req.currentUser.id, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ errors: ["Favorite not found"] });
    res.json(serializeFavorite(rows[0]));
  })
);

api.post(
  "/user_favorites",
  auth,
  wrap(async (req, res) => {
    const params = (req.body || {}).newFav || req.body || {};
    const pokemon = await pool.query("SELECT id FROM pokemons WHERE id = $1", [
      params.pokemon_id,
    ]);
    if (!pokemon.rows[0]) return res.status(422).json({ errors: ["Pokemon must exist"] });
    const inserted = await pool.query(
      "INSERT INTO user_favorites (user_id, pokemon_id) VALUES ($1, $2) RETURNING id",
      [req.currentUser.id, params.pokemon_id]
    );
    const { rows } = await pool.query(`${FAVORITE_SELECT} WHERE f.id = $1`, [inserted.rows[0].id]);
    res.json(serializeFavorite(rows[0]));
  })
);

api.delete(
  "/user_favorites/:id",
  auth,
  wrap(async (req, res) => {
    await pool.query("DELETE FROM user_favorites WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.currentUser.id,
    ]);
    res.status(204).end();
  })
);

// ---------- errors ----------

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ errors: ["Internal server error"] });
});

module.exports = app;
