import { Router } from "express";
import { handleGetVenue, handleGetVenues, handleNewVenue } from "../controllers/venues";

const router = Router();
router.route("/").post(handleNewVenue);
router.route("/").get(handleGetVenues);
router.route("/:id").get(handleGetVenue);

export default router;
