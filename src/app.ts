import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/setup";

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
