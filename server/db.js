const { Pool, types } = require("pg");

// Return bigint (int8) columns as JS numbers so ids serialize as integers,
// matching the old Rails API. Ids here stay far below Number.MAX_SAFE_INTEGER.
types.setTypeParser(types.builtins.INT8, (v) => parseInt(v, 10));

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres@localhost:5432/pokemon_minigame_dev";

// Neon/Supabase/etc. require TLS; local Postgres does not support it.
const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);

const pool = new Pool({
  connectionString,
  ssl: isLocal ? false : { rejectUnauthorized: false },
  // Serverless functions each hold their own pool; keep it small so the
  // free-tier connection limit isn't exhausted across concurrent invocations.
  max: 3,
});

module.exports = pool;
