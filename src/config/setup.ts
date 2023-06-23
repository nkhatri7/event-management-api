import { Pool } from "pg";

// Setup connection to database
export const pool: Pool = new Pool({
  user: process.env.POSTGRESQL_USER,
  password: process.env.POSTGRESQL_PASSWORD,
  host: "localhost",
  port: 5432,
  database: "event_management",
});
