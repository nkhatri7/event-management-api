import { Router } from "express";
import {
  handleGetActiveEvents,
  handleGetAllEvents,
  handleGetEvent,
  handleGetUserEvents,
  handleGetVenueEvents,
  handleNewEvent,
  handleUpdateEvent,
} from "../controllers/events";

const router = Router();
router.route("/").post(handleNewEvent);
router.route("/").get(handleGetAllEvents);
router.route("/:id").get(handleGetEvent);
router.route("/venue/:id").get(handleGetVenueEvents);
router.route("/user/:id").get(handleGetUserEvents);
router.route("/active").get(handleGetActiveEvents);
router.route("/:id").put(handleUpdateEvent);

export default router;
