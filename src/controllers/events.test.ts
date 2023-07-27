import { Request, Response } from "express";
import * as eventService from "../services/events";
import * as authUtils from "../utils/auth";
import {
  handleCancelEvent,
  handleGetActiveEvents,
  handleGetAllEvents,
  handleGetEvent,
  handleGetUserEvents,
  handleGetVenueEvents,
  handleNewEvent,
  handleUpdateEvent,
} from "./events";
import { StatusError } from "../utils/StatusError";
import { Event } from "../models/Event";

jest.mock("../services/venues");
jest.mock("../utils/auth");

describe("handleNewEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 when the request is unauthenticated", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 400 when the user ID is not in the request body", async () => {
    const mockRequest = {
      body: {
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the venue ID is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the day is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the month is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the year is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the start time is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the end time is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the guests is not in the request body", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the time slot is not available", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(false);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the requested venue can't fit the requested guests", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(true);
    jest.spyOn(eventService, "canFitGuests").mockResolvedValue(false);
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 201 when the event has been created", async () => {
    const mockRequest = {
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 15,
        endTime: 18,
        guests: 50,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(true);
    jest.spyOn(eventService, "canFitGuests").mockResolvedValue(true);
    jest.spyOn(eventService, "createEvent").mockResolvedValue({
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 15,
      endTime: 18,
      guests: 50,
      isCancelled: false,
    });
    await handleNewEvent(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(201);
  });
});

describe("handleGetAllEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {};
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleGetAllEvents(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest = {} as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getAllEvents").mockResolvedValue([]);
    await handleGetAllEvents(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleGetEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleGetEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 404 if no event has the ID from the params", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      query: { uid: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockImplementationOnce(() => {
      throw new StatusError(404, "Event with ID 1 doesn't exist");
    });
    await handleGetEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(404);
  });

  it("Should send a status code of 200 if an event with the ID in the params can be found", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      query: { uid: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 15,
      endTime: 18,
      guests: 50,
      isCancelled: false,
    });
    await handleGetEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleGetVenueEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleGetVenueEvents(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      query: { uid: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getVenueEvents").mockResolvedValue([]);
    await handleGetVenueEvents(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleGetUserEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleGetUserEvents(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      query: { uid: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getUserEvents").mockResolvedValue([]);
    await handleGetUserEvents(
      mockRequest as Request,
      mockResponse as Response
    );
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleGetActiveEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {};
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleGetActiveEvents(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest = {} as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getActiveEvents").mockResolvedValue([]);
    await handleGetActiveEvents(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleUpdateEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 for an unauthenticated request", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 400 if the user ID is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 17,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the venue ID is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 17,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the day is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        month: 1,
        year: 2023,
        startTime: 17,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the month is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        year: 2023,
        startTime: 17,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the year is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        startTime: 17,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the start time is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        endTime: 22,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the end time is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 17,
        guests: 50,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the guests is not in the request body", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 17,
        endTime: 22,
      },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 403 if the user ID given is not the same as the user ID of the event", async () => {
    const payload: eventService.EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
    };
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: payload,
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      ...payload,
      userId: 2,
      isCancelled: false,
    });
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(403);
  });

  it("Should send a status code of 400 if the event with the ID from the params is cancelled", async () => {
    const payload: eventService.EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
    };
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: payload,
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      ...payload,
      isCancelled: true,
    });
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the updated time slot is not available", async () => {
    const payload: eventService.EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
    };
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: payload,
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      ...payload,
      isCancelled: false,
    });
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(false);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the updated number of guests cannot fit in the venue", async () => {
    const payload: eventService.EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
    };
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: payload,
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      ...payload,
      isCancelled: false,
    });
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(true);
    jest.spyOn(eventService, "canFitGuests").mockResolvedValue(false);
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 200 if the updated details are ok and the user making the request is the event creator", async () => {
    const payload: eventService.EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
    };
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: payload,
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      ...payload,
      isCancelled: false,
    });
    jest.spyOn(eventService, "isTimeSlotAvailable").mockResolvedValue(true);
    jest.spyOn(eventService, "canFitGuests").mockResolvedValue(true);
    jest.spyOn(eventService, "updateEvent").mockResolvedValue({
      id: 1,
      ...payload,
      isCancelled: false,
    });
    await handleUpdateEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleCancelEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(false);
    await handleCancelEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 400 if the request body doesn't have a user ID", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: {},
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    await handleCancelEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 403 if the given user ID is not the same as the user ID of the event", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: { userId: 1 },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockResolvedValue({
      id: 1,
      userId: 2,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
      isCancelled: false,
    });
    await handleCancelEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(403);
  });

  it("Should send a status code of 200 if the request is authenticated and the user ID is the same as the user ID from the event", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      body: { userId: 1 },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthenticated").mockReturnValue(true);
    const event: Event = {
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 17,
      endTime: 22,
      guests: 50,
      isCancelled: false,
    };
    jest.spyOn(eventService, "getEvent").mockResolvedValue(event);
    jest.spyOn(eventService, "cancelEvent").mockResolvedValue({
      ...event,
      isCancelled: true,
    });
    await handleCancelEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});
