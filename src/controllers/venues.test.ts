import { Request, Response } from "express";
import { handleGetVenue, handleGetAllVenues, handleNewVenue, handleUpdateVenue } from "./venues";
import * as venueService from "../services/venues";
import * as authUtils from "../utils/auth";
import { Venue } from "../models/Venue";
import { StatusError } from "../utils/StatusError";

jest.mock("../services/venues");
jest.mock("../utils/auth");

describe("handleNewVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 400 when the name is not in the request body", async () => {
    const mockRequest = {
      body: {
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the address is not in the request body", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the postcode is not in the request body", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the state is not in the request body", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the capacity is not in the request body", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the hourly rate is not in the request body", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 401 when the request is unauthenticated", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 403 when the user making the request is not an admin", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(authUtils, "getUserFromId").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "some last name",
      email: "test@example.com",
      password: "hashedpassword",
      isAdmin: false,
    });
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(403);
  });

  it("Should send a status code of 201 when the user making the request is an admin", async () => {
    const mockRequest = {
      body: {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(authUtils, "getUserFromId").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "some last name",
      email: "test@example.com",
      password: "hashedpassword",
      isAdmin: true,
    });
    jest.spyOn(venueService, "createVenue").mockResolvedValue({
      id: 1,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 100,
      hourlyRate: 50,
    });
    await handleNewVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(201);
  });
});

describe("handleGetAllVenues", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 200 with an array of venues", async () => {
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const venues: Venue[] = [
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      },
      {
        id: 2,
        name: "Another venue name",
        address: "40 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      },
    ];
    jest.spyOn(venueService, "getAllVenues").mockResolvedValue(venues);
    await handleGetAllVenues({} as Request, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
    expect(mockResponse.json).toBeCalledWith(venues);
  });
});

describe("handleGetVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 404 if a venue with the given ID doesn't exist", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(venueService, "getVenue").mockImplementationOnce(() => {
      throw new StatusError(404, "Venue doesn't exist");
    });
    await handleGetVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(404);
  });

  it("Should send a status code of 200 if the venue with the given ID exists", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(venueService, "getVenue").mockResolvedValue({
      id: 1,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 100,
      hourlyRate: 50,
    });
    await handleGetVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});

describe("handleUpdateVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 400 if the capacity is not in the request body", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: { hourlyRate: 60 },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the hourly rate is not in the request body", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: { capacity: 120 },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 if the hourly rate is not in the request body", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: { capacity: 120 },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 401 if the request is unauthenticated", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: {
        userId: 1,
        capacity: 120,
        hourlyRate: 60,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(false);
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should send a status code of 403 if the user making the request is not an admin", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: {
        userId: 1,
        capacity: 120,
        hourlyRate: 60,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(authUtils, "getUserFromId").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "some last name",
      email: "test@example.com",
      password: "hashedpassword",
      isAdmin: false,
    });
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(403);
  });

  it("Should send a status code of 200 if the user making the request is an admin", async () => {
    const mockRequest = {
      params: { id: "1" } as unknown,
      body: {
        userId: 1,
        capacity: 120,
        hourlyRate: 60,
      },
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authUtils, "isAuthorised").mockReturnValue(true);
    jest.spyOn(authUtils, "getUserFromId").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "some last name",
      email: "test@example.com",
      password: "hashedpassword",
      isAdmin: true,
    });
    jest.spyOn(venueService, "updateVenue").mockResolvedValue({
      id: 1,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 120,
      hourlyRate: 60,
    });
    await handleUpdateVenue(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});
