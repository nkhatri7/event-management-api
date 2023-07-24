import { Pool } from "pg";
import {
  EventPayload,
  canFitGuests,
  createEvent,
  formatDate,
  formatNumber,
  getAllEvents,
  getDateIntervals,
  getEvent,
  getEventFromQueryResultRow,
  getVenueEvents,
  isTimeSlotAvailable,
} from "./events";
import { getMockQueryResult } from "../mocks/database";
import { Event } from "../models/Event";

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

describe("isTimeSlotAvailable", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return false if payload start time is before 8AM", async () => {
    const payload: EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
    };
    expect(await isTimeSlotAvailable(payload)).toBe(false);
  });

  it("Should return false if payload end time is after 10PM", async () => {
    const payload: EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 18,
      endTime: 23,
      guests: 100,
    };
    expect(await isTimeSlotAvailable(payload)).toBe(false);
  });

  it("Should return false if there is another event at the same venue and same day within 3 hours of the start time", async () => {
    const payload: EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 18,
      endTime: 22,
      guests: 100,
    };
    const mockQueryResult = getMockQueryResult([{
      userId: 1,
      venueId: 1,
      date: "2023-01-01",
      startTime: 15,
      endTime: 20,
      guests: 100,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await isTimeSlotAvailable(payload)).toBe(false);
  });

  it("Should return false if there is another event at the same venue and same day within 3 hours of the end time", async () => {
    const payload: EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 10,
      endTime: 13,
      guests: 100,
    };
    const mockQueryResult = getMockQueryResult([{
      userId: 1,
      venueId: 1,
      date: "2023-01-01",
      startTime: 15,
      endTime: 20,
      guests: 100,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await isTimeSlotAvailable(payload)).toBe(false);
  });

  it("Should return true if there are no other events within 3 hours of the start or end time on the same day at the same venue", async () => {
    const payload: EventPayload = {
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 10,
      endTime: 13,
      guests: 100,
    };
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await isTimeSlotAvailable(payload)).toBe(true);
  });
});

describe("canFitGuests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return false if the number of guests is more than the venue capacity", async () => {
    const venue = createVenueObject(100);
    const mockQueryResult = getMockQueryResult([venue]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await canFitGuests(1, 101)).toBe(false);
  });

  it("Should return true if the number of guests is less than the venue capacity", async () => {
    const venue = createVenueObject(100);
    const mockQueryResult = getMockQueryResult([venue]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await canFitGuests(1, 99)).toBe(true);
  });

  it("Should return true if the number of guests is the same as the venue capacity", async () => {
    const venue = createVenueObject(100);
    const mockQueryResult = getMockQueryResult([venue]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await canFitGuests(1, 100)).toBe(true);
  });
});

describe("createEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Creates an event object with an ID from the data in the payload", async () => {
    const event: Event = {
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
      isCancelled: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, isCancelled, ...payload } = event;
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await createEvent(payload)).toEqual(event);
  });
});

describe("getAllEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an empty array when no events are in the database", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllEvents()).toEqual([]);
  });

  it("Should return an array of one event when there is one event", async () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllEvents()).toEqual([{
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
      isCancelled: false,
    }]);
  });

  it("Should return an array of two events when there are two events", async () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        user_id: 1,
        venue_id: 1,
        date: "2023-01-01",
        start_time: 7,
        end_time: 11,
        guests: 100,
        is_cancelled: false,
      },
      {
        id: 2,
        user_id: 1,
        venue_id: 1,
        date: "2023-01-02",
        start_time: 7,
        end_time: 11,
        guests: 100,
        is_cancelled: false,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getAllEvents()).toEqual([
      {
        id: 1,
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 7,
        endTime: 11,
        guests: 100,
        isCancelled: false,
      },
      {
        id: 2,
        userId: 1,
        venueId: 1,
        day: 2,
        month: 1,
        year: 2023,
        startTime: 7,
        endTime: 11,
        guests: 100,
        isCancelled: false,
      },
    ]);
  });
});

describe("getEvent", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should throw an error if an event with the given ID doesn't exist", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(async () => await getEvent(1)).rejects.toThrowError();
  });

  it("Should return an event with the given ID if it exists", async () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getEvent(1)).toEqual({
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
      isCancelled: false,
    });
  });
});

describe("getVenueEvents", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an empty array when no events are in the database", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getVenueEvents(1)).toEqual([]);
  });

  it("Should return an array of one event when there is one event", async () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getVenueEvents(1)).toEqual([{
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
      isCancelled: false,
    }]);
  });

  it("Should return an array of two events when there are two events", async () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        user_id: 1,
        venue_id: 1,
        date: "2023-01-01",
        start_time: 7,
        end_time: 11,
        guests: 100,
        is_cancelled: false,
      },
      {
        id: 2,
        user_id: 1,
        venue_id: 1,
        date: "2023-01-02",
        start_time: 7,
        end_time: 11,
        guests: 100,
        is_cancelled: false,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(await getVenueEvents(1)).toEqual([
      {
        id: 1,
        userId: 1,
        venueId: 1,
        day: 1,
        month: 1,
        year: 2023,
        startTime: 7,
        endTime: 11,
        guests: 100,
        isCancelled: false,
      },
      {
        id: 2,
        userId: 1,
        venueId: 1,
        day: 2,
        month: 1,
        year: 2023,
        startTime: 7,
        endTime: 11,
        guests: 100,
        isCancelled: false,
      },
    ]);
  });
});

describe("getEventFromQueryResultRow", () => {
  it("Should return an Event object when no attributes are missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    const expectedResult: Event = {
      id: 1,
      userId: 1,
      venueId: 1,
      day: 1,
      month: 1,
      year: 2023,
      startTime: 7,
      endTime: 11,
      guests: 100,
      isCancelled: false,
    };
    expect(getEventFromQueryResultRow(mockQueryResult.rows[0])).toEqual(
      expectedResult
    );
  });

  it("Should throw an error if the ID is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the user ID is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the venue ID is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the date is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the start time is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if the end time is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if guests is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should throw an error if is_cancelled is missing", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .toThrowError();
  });

  it("Should not throw an error if is_cancelled is false", () => {
    const mockQueryResult = getMockQueryResult([{
      id: 1,
      user_id: 1,
      venue_id: 1,
      date: "2023-01-01",
      start_time: 7,
      end_time: 11,
      guests: 100,
      is_cancelled: false,
    }]);
    expect(() => getEventFromQueryResultRow(mockQueryResult.rows[0]))
      .not
      .toThrowError();
  });
});

describe("formatDate", () => {
  it("Should return 2023-01-01 when the day is 1, month is 1, and year is 2023", () => {
    expect(formatDate(1, 1, 2023)).toBe("2023-01-01");
  });

  it("Should return 2023-01-02 when the day is 2, month is 1, and year is 2023", () => {
    expect(formatDate(2, 1, 2023)).toBe("2023-01-02");
  });

  it("Should return 2023-02-01 when the day is 1, month is 2, and year is 2023", () => {
    expect(formatDate(1, 2, 2023)).toBe("2023-02-01");
  });

  it("Should return 2022-00-01 when the day is 1, month is 1, and year is 2022", () => {
    expect(formatDate(1, 1, 2022)).toBe("2022-01-01");
  });
});

describe("getDateIntervals", () => {
  it("Should return the day as 1 when the given date is 2023-01-01", () => {
    const dateIntervals = getDateIntervals("2023-01-01");
    expect(dateIntervals.day).toBe(1);
  });

  it("Should return the month as 1 when the given date is 2023-01-01", () => {
    const dateIntervals = getDateIntervals("2023-01-01");
    expect(dateIntervals.month).toBe(1);
  });

  it("Should return the year as 2023 when the given date is 2023-01-01", () => {
    const dateIntervals = getDateIntervals("2023-01-01");
    expect(dateIntervals.year).toBe(2023);
  });

  it("Should return the day as 2 when the given date is 2023-01-02", () => {
    const dateIntervals = getDateIntervals("2023-01-02");
    expect(dateIntervals.day).toBe(2);
  });

  it("Should return the month as 2 when the given date is 2023-02-01", () => {
    const dateIntervals = getDateIntervals("2023-02-01");
    expect(dateIntervals.month).toBe(2);
  });

  it("Should return the year as 2022 when the given date is 2022-01-01", () => {
    const dateIntervals = getDateIntervals("2022-01-01");
    expect(dateIntervals.year).toBe(2022);
  });
});

describe("formatNumber", () => {
  it("Should return 01 if the number given is 1", () => {
    expect(formatNumber(1)).toBe("01");
  });

  it("Should return 02 if the number given is 2", () => {
    expect(formatNumber(2)).toBe("02");
  });

  it("Should return 03 if the number given is 3", () => {
    expect(formatNumber(3)).toBe("03");
  });

  it("Should return 10 if the number given is 10", () => {
    expect(formatNumber(10)).toBe("10");
  });

  it("Should return 20 if the number given is 20", () => {
    expect(formatNumber(20)).toBe("20");
  });

  it("Should return 30 if the number given is 30", () => {
    expect(formatNumber(30)).toBe("30");
  });

  it("Should throw an error if the number given is -1", () => {
    expect(() => formatNumber(-1)).toThrowError();
  });

  it("Should throw an error if the number given is -10", () => {
    expect(() => formatNumber(-10)).toThrowError();
  });

  it("Should throw an error if the number given is -20", () => {
    expect(() => formatNumber(-20)).toThrowError();
  });

  it("Should return 00 if the number given is 0", () => {
    expect(formatNumber(0)).toBe("00");
  });
});

/**
 * Creates a mock venue object from a database query with the given capacity.
 * @param capacity The capacity of the venue.
 * @returns A venue object with the given capacity.
 */
const createVenueObject = (capacity: number) => {
  return {
    id: 1,
    name: "Venue",
    address: "some address",
    postcode: 2223,
    state: "NSW",
    capacity,
    hourly_rate: 100,
  };
};
