import { Request, Response } from "express";
import {
  VenuePayload,
  createVenue,
  getVenue,
  getVenues,
} from "../services/venues";
import { getUserFromId, isAuthorised } from "../utils/auth";
import { StatusError } from "../utils/StatusError";

export const handleNewVenue = async (req: Request, res: Response) => {
  try {
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
    if (!isAuthorised(req)) {
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
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.log(err);
    }
    res.status(err.code || 500).json(err.message || err);
  }
};

export const handleGetVenues = async (req: Request, res: Response) => {
  try {
    const venues = await getVenues();
    res.status(200).json(venues);
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.log(err);
    }
    res.status(err.code || 500).json(err.message || err);
  }
};

export const handleGetVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      throw new StatusError(400, "Missing parameters");
    }
    const venue = await getVenue(parseInt(id));
    res.status(200).json(venue);
  } catch (err: any) {
    if (process.env.NODE_ENV !== "test") {
      console.log(err);
    }
    res.status(err.code || 500).json(err.message || err);
  }
};
