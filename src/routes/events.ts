import { Router } from "express";
import { handleGetAllEvents, handleNewEvent } from "../controllers/events";

const router = Router();
router.route("/").post(handleNewEvent);
router.route("/").get(handleGetAllEvents);

export default router;
