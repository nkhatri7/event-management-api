import express from "express";
import { handleLogin, handleRegistration } from "../controllers/auth";

const router = express.Router();
router.route("/register").post(handleRegistration);
router.route("/login").post(handleLogin);

export default router;
