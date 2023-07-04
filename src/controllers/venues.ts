import { Request, Response } from "express";
import { VenuePayload, createVenue } from "../services/venues";
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
    console.log(err);
    res.status(err.status || 500).json(err.message || err);
  }
};