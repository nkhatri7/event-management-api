import { Router } from "express";
import { handleLogin, handleRegistration } from "../controllers/auth";

const router = Router();
router.route("/register").post(handleRegistration);
router.route("/login").post(handleLogin);

export default router;
