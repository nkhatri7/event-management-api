import { Router } from "express";
import {
  handleGetAllVenues,
  handleGetVenue,
  handleNewVenue,
  handleUpdateVenue,
} from "../controllers/venues";

const router = Router();
router.route("/").post(handleNewVenue);
router.route("/").get(handleGetAllVenues);
router.route("/:id").get(handleGetVenue);
router.route("/:id").patch(handleUpdateVenue);

export default router;
