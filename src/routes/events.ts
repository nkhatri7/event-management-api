import { Router } from "express";
import { handleNewEvent } from "../controllers/events";

const router = Router();
router.route("/").post(handleNewEvent);

export default router;
