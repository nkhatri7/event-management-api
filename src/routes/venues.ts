import { Router } from "express";
import { handleGetVenues, handleNewVenue } from "../controllers/venues";

const router = Router();
router.route("/").post(handleNewVenue);
router.route("/").get(handleGetVenues);

export default router;
