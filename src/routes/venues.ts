import { Router } from "express";
import { handleNewVenue } from "../controllers/venues";

const router = Router();
router.route("/").post(handleNewVenue);

export default router;
