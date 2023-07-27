import { Request, Response } from "express";
import {
  UpdateVenuePayload,
  VenuePayload,
  createVenue,
  getAllVenues,
  getVenue,
  updateVenue,
} from "../services/venues";
import { safeHandler } from "../middleware/wrapper";
import { getUserFromId, isAuthenticated } from "../utils/auth";
import { StatusError } from "../utils/StatusError";

export const handleNewVenue = safeHandler(
  async (req: Request, res: Response) => {
    const {
      name,
      address,
      postcode,
      state,
      capacity,
      hourlyRate,
    }: VenuePayload = req.body;
    if (!name || !address || !postcode || !state || !capacity || !hourlyRate) {
      throw new StatusError(400, "Missing parameters");
    }
    if (!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const user = await getUserFromId(req.body.userId);
    if (!user.isAdmin) {
      throw new StatusError(403, "Unauthorised. User is not an admin");
    }
    const newVenue = await createVenue({
      name,
      address,
      postcode,
      state,
      capacity,
      hourlyRate,
    });
    res.status(201).json(newVenue);
  }
);

export const handleGetAllVenues = safeHandler(
  async (req: Request, res: Response) => {
    const venues = await getAllVenues();
    res.status(200).json(venues);
  }
);

export const handleGetVenue = safeHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const venue = await getVenue(parseInt(id));
    res.status(200).json(venue);
  }
);

export const handleUpdateVenue = safeHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { capacity, hourlyRate }: UpdateVenuePayload = req.body;
    if (!id || !capacity || !hourlyRate) {
      throw new StatusError(400, "Missing parameters");
    }
    if (!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const user = await getUserFromId(req.body.userId);
    if (!user.isAdmin) {
      throw new StatusError(403, "Unauthorised. User is not an admin");
    }
    const venue = await updateVenue(parseInt(id), { capacity, hourlyRate });
    res.status(200).json(venue);
  }
);
