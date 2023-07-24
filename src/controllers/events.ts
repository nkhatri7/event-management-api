import { Request, Response } from "express";
import { safeHandler } from "../middleware/wrapper";
import {
  EventPayload,
  canFitGuests,
  createEvent,
  getAllEvents,
  getEvent,
  getVenueEvents,
  isTimeSlotAvailable,
} from "../services/events";
import { StatusError } from "../utils/StatusError";
import { isAuthorised } from "../utils/auth";

export const handleNewEvent = safeHandler(
  async (req: Request, res: Response) => {
    const {
      userId,
      venueId,
      day,
      month,
      year,
      startTime,
      endTime,
      guests,
    }: EventPayload = req.body;
    if(!isAuthorised(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    if (!userId || !venueId || !day || !month || !year || !startTime
        || !endTime || !guests) {
      throw new StatusError(400, "Missing parameters");
    }
    if (!(await isTimeSlotAvailable(req.body as EventPayload))) {
      throw new StatusError(400, "Time slot isn't available");
    }
    if (!(await canFitGuests(venueId, guests))) {
      throw new StatusError(400, "Venue cannot fit required guests");
    }
    const newEvent = await createEvent(req.body as EventPayload);
    res.status(201).json(newEvent);
  }
);

export const handleGetAllEvents = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthorised(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const events = await getAllEvents();
    res.status(200).json(events);
  }
);

export const handleGetEvent = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthorised(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const { id } = req.params;
    const event = await getEvent(parseInt(id));
    res.status(200).json(event);
  }
);

export const handleGetVenueEvents = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthorised(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const { id } = req.params;
    const events = await getVenueEvents(parseInt(id));
    res.status(200).json(events);
  }
);
