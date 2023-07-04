import { Pool } from "pg";
import { createVenue, getVenueFromQueryResultRow, getVenues } from "./venues";
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

describe("getVenues", () => {
  it("Should return an empty array when no venues exist", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getVenues()).toEqual([]);
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
    expect(await getVenues()).toEqual([
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
    expect(await getVenues()).toEqual([
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
