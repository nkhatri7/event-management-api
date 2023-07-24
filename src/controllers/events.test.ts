import { Request, Response } from "express";
import * as eventService from "../services/events";
import * as authUtils from "../utils/auth";
import {
  handleGetActiveEvents,
  handleGetAllEvents,
  handleGetEvent,
  handleGetUserEvents,
  handleGetVenueEvents,
  handleNewEvent,
} from "./events";
import { StatusError } from "../utils/StatusError";

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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
    await handleGetAllEvents(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest = {} as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
    await handleGetEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 400 if the ID in the params is invalid", async () => {
    const mockRequest: Partial<Request> = {
      params: { id: "1" },
      query: { uid: "1" },
    };
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(eventService, "getEvent").mockImplementationOnce(() => {
      throw new StatusError(400, "Event with ID 1 doesn't exist");
    });
    await handleGetEvent(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
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
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
    await handleGetActiveEvents(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 200 if the request is authenticated", async () => {
    const mockRequest = {} as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(eventService, "getActiveEvents").mockResolvedValue([]);
    await handleGetActiveEvents(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});
