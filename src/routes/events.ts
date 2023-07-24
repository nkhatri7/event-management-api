import { Router } from "express";
import {
  handleGetAllEvents,
  handleGetEvent,
  handleGetUserEvents,
  handleGetVenueEvents,
  handleNewEvent,
} from "../controllers/events";

const router = Router();
router.route("/").post(handleNewEvent);
router.route("/").get(handleGetAllEvents);
router.route("/:id").get(handleGetEvent);
router.route("/venue/:id").get(handleGetVenueEvents);
router.route("/user/:id").get(handleGetUserEvents);

export default router;
