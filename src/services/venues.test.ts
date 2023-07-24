import { Pool } from "pg";
import {
  createVenue,
  getAllVenues,
  getVenue,
  getVenueFromQueryResultRow,
  updateVenue,
} from "./venues";
import { getMockQueryResult } from "../mocks/database";
import { Venue } from "../models/Venue";

jest.mock("pg", () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  };

  return {
    Pool: jest.fn(() => mockPool),
    QueryResult: jest.requireActual("pg").QueryResult,
  };
});

describe("createVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return a new venue object with an ID and the given data", async () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    const newVenue: Venue = {
      id: 1,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 100,
      hourlyRate: 50,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...venuePayload } = newVenue;
    expect(await createVenue(venuePayload)).toEqual(newVenue);
  });
});

describe("getAllVenues", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an empty array when no venues exist", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllVenues()).toEqual([]);
  });

  it("Should return an array of one venue when there is one venue", async () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllVenues()).toEqual([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourlyRate: 50,
      },
    ]);
  });

  it("Should return an array of two venues when there are two venues", async () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
      {
        id: 2,
        name: "Another venue name",
        address: "40 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllVenues()).toEqual([
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
    ]);
  });
});

describe("getVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return the venue with the given ID", async () => {
    const venueId = 1;
    const mockQueryResult = getMockQueryResult([
      {
        id: venueId,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getVenue(venueId)).toEqual({
      id: venueId,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 100,
      hourlyRate: 50,
    });
  });

  it("Should throw an error if a venue with the given ID doesn't exist", async () => {
    const venueId = 2;
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(async () => await getVenue(venueId)).rejects.toThrowError();
  });
});

describe("updateVenue", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return the venue object with the updated values", async () => {
    const venueId = 1;
    const mockQueryResult = getMockQueryResult([
      {
        id: venueId,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 120,
        hourly_rate: 60,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await updateVenue(venueId, { capacity: 120, hourlyRate: 60 }))
      .toEqual({
        id: venueId,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 120,
        hourlyRate: 60,
      });
  });

  it("Should throw an error if a venue with the given ID doesn't exist", async () => {
    const venueId = 2;
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(async () => {
      await updateVenue(venueId, { capacity: 120, hourlyRate: 60 });
    }).rejects.toThrowError();
  });
});

describe("getVenueFromQueryResultRow", () => {
  it("Should return a Venue object from the query result row", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    const expectedResult: Venue = {
      id: 1,
      name: "Some venue name",
      address: "10 Test St",
      postcode: "2000",
      state: "NSW",
      capacity: 100,
      hourlyRate: 50,
    };
    expect(getVenueFromQueryResultRow(mockQueryResult.rows[0])).toEqual(
      expectedResult
    );
  });

  it("Should throw an error if the ID cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the name cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the address cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the postcode cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        state: "NSW",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the state cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        capacity: 100,
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the capacity cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        hourly_rate: 50,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the hourly rate cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        name: "Some venue name",
        address: "10 Test St",
        postcode: "2000",
        state: "NSW",
        capacity: 100,
      },
    ]);
    expect(() => getVenueFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });
});
