// Creates the schema and seeds the pokedex from PokeAPI (the same source the
// old Rails seeds used). Safe to re-run: the pokemons table is only seeded
// when empty, user data is never touched.
//
// Usage: DATABASE_URL=postgres://... node scripts/seed.js

const fs = require("fs");
const path = require("path");
const pool = require("../server/db");

const POKEMON_COUNT = 898;
const CONCURRENCY = 20;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  return res.json();
}

async function fetchPokemon() {
  const list = await fetchJson(
    `https://pokeapi.co/api/v2/pokemon?limit=${POKEMON_COUNT}&offset=0`
  );
  const results = list.results;
  const pokemon = new Array(results.length);
  let next = 0;

  async function worker() {
    while (next < results.length) {
      const i = next++;
      const p = await fetchJson(results[i].url);
      pokemon[i] = {
        name: p.name,
        type_one: p.types[0].type.name,
        type_two: p.types[1] ? p.types[1].type.name : null,
        image: p.sprites.front_default,
        official_image: p.sprites.other["official-artwork"].front_default,
        hp: p.stats[0].base_stat,
        attack: p.stats[1].base_stat,
        defense: p.stats[2].base_stat,
        special_attack: p.stats[3].base_stat,
        special_defense: p.stats[4].base_stat,
        speed: p.stats[5].base_stat,
      };
      if ((i + 1) % 100 === 0) console.log(`fetched ${i + 1}/${results.length} pokemon`);
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  return pokemon;
}

async function main() {
  const schema = fs.readFileSync(path.join(__dirname, "..", "db", "schema.sql"), "utf8");
  await pool.query(schema);
  console.log("schema: ok");

  const { rows: existing } = await pool.query("SELECT count(*)::int AS n FROM pokemons");
  if (existing[0].n > 0) {
    console.log(`pokemons: already has ${existing[0].n} rows, skipping`);
  } else {
    console.log(`fetching ${POKEMON_COUNT} pokemon from PokeAPI...`);
    const pokemon = await fetchPokemon();
    for (const p of pokemon) {
      await pool.query(
        `INSERT INTO pokemons (name, type_one, type_two, image, official_image,
                               hp, attack, defense, special_attack, special_defense, speed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          p.name,
          p.type_one,
          p.type_two,
          p.image,
          p.official_image,
          p.hp,
          p.attack,
          p.defense,
          p.special_attack,
          p.special_defense,
          p.speed,
        ]
      );
    }
    console.log(`pokemons: seeded ${pokemon.length} rows`);
  }

  await pool.end();
  console.log("Done seeding");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
