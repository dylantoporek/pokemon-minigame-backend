-- Postgres schema for the Pokemon minigame app (port of the Rails schema.rb)

CREATE TABLE IF NOT EXISTS users (
  id bigserial PRIMARY KEY,
  username varchar UNIQUE NOT NULL,
  password_digest varchar NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS pokemons (
  id bigserial PRIMARY KEY,
  name varchar,
  type_one varchar,
  type_two varchar,
  image varchar,
  official_image varchar,
  hp integer,
  attack integer,
  defense integer,
  special_attack integer,
  special_defense integer,
  speed integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id bigserial PRIMARY KEY,
  user_id bigint NOT NULL REFERENCES users (id),
  pokemon_id bigint NOT NULL REFERENCES pokemons (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS index_user_favorites_on_user_id ON user_favorites (user_id);
CREATE INDEX IF NOT EXISTS index_user_favorites_on_pokemon_id ON user_favorites (pokemon_id);
