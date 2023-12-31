import { Request, Response } from "express";
import { safeHandler } from "../middleware/wrapper";
import {
  EventPayload,
  canFitGuests,
  cancelEvent,
  createEvent,
  getActiveEvents,
  getAllEvents,
  getEvent,
  getUserEvents,
  getVenueEvents,
  isTimeSlotAvailable,
  updateEvent,
} from "../services/events";
import { StatusError } from "../utils/StatusError";
import { isAuthenticated } from "../utils/auth";

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
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    if (!userId || !venueId || !day || !month || !year || !startTime || !endTime
        || !guests) {
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
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const events = await getAllEvents();
    res.status(200).json(events);
  }
);

export const handleGetEvent = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const { id } = req.params;
    const event = await getEvent(parseInt(id));
    res.status(200).json(event);
  }
);

export const handleGetVenueEvents = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const { id } = req.params;
    const events = await getVenueEvents(parseInt(id));
    res.status(200).json(events);
  }
);

export const handleGetUserEvents = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const { id } = req.params;
    const events = await getUserEvents(parseInt(id));
    res.status(200).json(events);
  }
);

export const handleGetActiveEvents = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const events = await getActiveEvents();
    res.status(200).json(events);
  }
);

export const handleUpdateEvent = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    const {
      userId,
      venueId,
      day,
      month,
      year,
      startTime,
      endTime,
      guests
    }: EventPayload = req.body;
    if (!userId || !venueId || !day || !month || !year || !startTime || !endTime
        || !guests) {
      throw new StatusError(400, "Missing parameters");
    }
    const { id } = req.params;
    const event = await getEvent(parseInt(id));
    if (userId !== event.userId) {
      throw new StatusError(403, "Unauthorised - not the user's event");
    }
    if (event.isCancelled) {
      throw new StatusError(400, "Cannot update cancelled event");
    }
    if (!(await isTimeSlotAvailable(req.body as EventPayload))) {
      throw new StatusError(400, "Time slot isn't available");
    }
    if (!(await canFitGuests(venueId, guests))) {
      throw new StatusError(400, "Venue cannot fit required guests");
    }
    const updatedEvent = await updateEvent(
      parseInt(id),
      req.body as EventPayload
    );
    res.status(200).json(updatedEvent);
  }
);

export const handleCancelEvent = safeHandler(
  async (req: Request, res: Response) => {
    if(!isAuthenticated(req)) {
      throw new StatusError(401, "Unauthorised");
    }
    if (!req.body.userId) {
      throw new StatusError(400, "Missing parameters");
    }
    const { id } = req.params;
    const event = await getEvent(parseInt(id));
    if (req.body.userId !== event.userId) {
      throw new StatusError(403, "Unauthorised - not the user's event");
    }
    const updatedEvent = await cancelEvent(parseInt(id));
    res.status(200).json(updatedEvent);
  }
);
