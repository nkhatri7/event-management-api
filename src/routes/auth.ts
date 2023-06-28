import express from "express";
import { handleRegistration } from "../controllers/auth";

const router = express.Router();
router.route("/register").post(handleRegistration);

export default router;
