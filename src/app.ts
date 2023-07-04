import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./routes/auth";
import venuesRouter from "./routes/venues";

dotenv.config();

const app: Express = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/venues", venuesRouter);

const port: string | number = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
