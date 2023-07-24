import { Router } from "express";
import {
  handleGetAllEvents,
  handleGetEvent,
  handleNewEvent,
} from "../controllers/events";

const router = Router();
router.route("/").post(handleNewEvent);
router.route("/").get(handleGetAllEvents);
router.route("/:id").get(handleGetEvent);

export default router;
