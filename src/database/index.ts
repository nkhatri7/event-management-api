import pg from "pg";

// Setup connection to database
export const pool: pg.Pool = new pg.Pool({
  user: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "event_management",
});
