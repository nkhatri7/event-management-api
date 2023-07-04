import { Router } from "express";
import { handleGetVenue, handleGetAllVenues, handleNewVenue } from "../controllers/venues";

const router = Router();
router.route("/").post(handleNewVenue);
router.route("/").get(handleGetAllVenues);
router.route("/:id").get(handleGetVenue);

export default router;
