import { QueryConfig, QueryResultRow } from "pg";
import { Event } from "../models/Event";
import { pool } from "../database";
import { getVenueFromQueryResultRow } from "./venues";
import { StatusError } from "../utils/StatusError";

export type EventPayload = Omit<Event, "id" | "isCancelled">;
interface DateIntervals {
  day: number;
  month: number;
  year: number;
}

/**
 * Checks if the timeslot from the event payload is available.
 * @param payload The event information.
 * @returns `true` if the time slot is available, `false` if it is not.
 */
export const isTimeSlotAvailable = async (
  payload: EventPayload
): Promise<boolean> => {
  const { venueId, day, month, year, startTime, endTime } = payload;
  /* BUSINESS RULES FOR EVENTS:
      - Venues are open from 8AM to 10PM
      - Can only book at hour internals (e.g. 8:30 is not allowed)
      - Events on the same day require 3 hour gap to account for cleanup + setup
  */
  if (startTime < 8 || endTime > 22) {
    return false;
  }
  const date = formatDate(day, month, year);
  const query: QueryConfig = {
    text: "SELECT * FROM event WHERE venue_id = $1 AND date = $2 AND (start_time >= $3 OR end_time <= $4) AND is_cancelled = $5",
    values: [venueId, date, startTime - 3, endTime + 3, false],
  };
  const queryResult = await pool.query(query);
  return queryResult.rowCount === 0;
};

/**
 * Checks if the number of guests from the event request is less than or equal
 * to the maximum number of guests allowed at the selected venue from the
 * event request.
 * @param venueId The venue ID from the event request.
 * @param guests The number of guests from the event request.
 * @returns `true` if the number of guests can fit in the venue, `false`
 * otherwise.
 */
export const canFitGuests = async (
  venueId: number,
  guests: number
): Promise<boolean> => {
  const query: QueryConfig = {
    text: "SELECT * FROM venue WHERE id = $1",
    values: [venueId],
  };
  const queryResult = await pool.query(query);
  const venue = getVenueFromQueryResultRow(queryResult.rows[0]);
  return guests <= venue.capacity;
};

/**
 * Creates an event in the database with the data in the given payload.
 * @param payload The event information.
 * @returns An event object with an ID and the given event data.
 */
export const createEvent = async (payload: EventPayload): Promise<Event> => {
  const query: QueryConfig = {
    text: "INSERT INTO event(user_id, venue_id, date, start_time, end_time, guests, is_cancelled) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
    values: [
      payload.userId,
      payload.venueId,
      formatDate(payload.day, payload.month, payload.year),
      payload.startTime,
      payload.endTime,
      payload.guests,
      false,
    ],
  };
  const queryResult = await pool.query(query);
  return getEventFromQueryResultRow(queryResult.rows[0]);
};

/**
 * Gets all the events from the event table in the database.
 * @returns An array of all events in the database.
 */
export const getAllEvents = async (): Promise<Event[]> => {
  const query: QueryConfig = { text: "SELECT * FROM event" };
  const queryResult = await pool.query(query);
  return queryResult.rows.map((row) => getEventFromQueryResultRow(row));
};

/**
 * Gets the event with the given ID from the database.
 * @param id The ID of the event.
 * @returns An event object with the given ID.
 */
export const getEvent = async (id: number): Promise<Event> => {
  const query: QueryConfig = {
    text: "SELECT * FROM event WHERE id = $1",
    values: [id],
  };
  const queryResult = await pool.query(query);
  if (queryResult.rowCount === 0) {
    throw new StatusError(400, `Event with ID ${id} doesn't exist`);
  }
  return getEventFromQueryResultRow(queryResult.rows[0]);
};

/**
 * Gets all the events from the venue with the given ID.
 * @param id The ID of a venue.
 * @returns An array of all the events from a venue.
 */
export const getVenueEvents = async (id: number): Promise<Event[]> => {
  const query: QueryConfig = {
    text: "SELECT * FROM event WHERE venue_id = $1",
    values: [id],
  };
  const queryResult = await pool.query(query);
  return queryResult.rows.map((row) => getEventFromQueryResultRow(row));
};

/**
 * Gets all the events for a user with the given ID.
 * @param id The ID of a user.
 * @returns An array of all the events for a user.
 */
export const getUserEvents = async (id: number): Promise<Event[]> => {
  const query: QueryConfig = {
    text: "SELECT * FROM event WHERE user_id = $1",
    values: [id],
  };
  const queryResult = await pool.query(query);
  return queryResult.rows.map((row) => getEventFromQueryResultRow(row));
};

/**
 * Gets all the events from the database that are not cancelled are not in the
 * past.
 * @returns An array of the active events.
 */
export const getActiveEvents = async (): Promise<Event[]> => {
  const query: QueryConfig = {
    text: "SELECT * FROM event WHERE is_cancelled = $1",
    values: [false],
  };
  const queryResult = await pool.query(query);
  const uncancelledEvents = queryResult.rows.map((row) => (
    getEventFromQueryResultRow(row)
  ));
  return uncancelledEvents.filter((event) => !hasEventHappened(event));
};

/**
 * Extracts the relevant event data from the given query result row.
 * @param queryResultRow A row from the query result.
 * @returns An event object with the data from the query result row.
 */
export const getEventFromQueryResultRow = (
  queryResultRow: QueryResultRow
): Event => {
  const id = queryResultRow["id"];
  const userId = queryResultRow["user_id"];
  const venueId = queryResultRow["venue_id"];
  const date = queryResultRow["date"];
  const startTime = queryResultRow["start_time"];
  const endTime = queryResultRow["end_time"];
  const guests = queryResultRow["guests"];
  const isCancelled = queryResultRow["is_cancelled"];
  if (!id || !userId || !venueId || !date || !startTime || !endTime || !guests
      || isCancelled === undefined) {
    throw new Error("Could not receive event from the database");
  }
  const { day, month, year } = getDateIntervals(date);

  return {
    id,
    userId,
    venueId,
    day,
    month,
    year,
    startTime,
    endTime,
    guests,
    isCancelled
  };
};

/**
 * Checks if an event has occurred.
 * @param event The event being checked.
 * @returns `true` if the current time is past the event's start time, `false`
 * otherwise.
 */
export const hasEventHappened = (event: Event): boolean => {
  const now = new Date();
  const { day, month, year, startTime } = event;
  const eventTime = new Date(year, month - 1, day, startTime);
  return now > eventTime;
};

/**
 * Formats the given day, month and year into the following format: YYYY-MM-DD.
 * @param day The day of the month.
 * @param month The month in the year.
 * @param year The year.
 * @returns A string in the following format: YYYY-MM-DD.
 */
export const formatDate = (
  day: number,
  month: number,
  year: number
): string => {
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`;
};

/**
 * Gets the day, month and year from a string of a date in the format of
 * YYYY-MM-DD.
 * @param date A string in the format of YYYY-MM-DD
 * @returns The day, month and year from the date string.
 */
export const getDateIntervals = (date: string): DateIntervals => {
  const intervalStrings = date.split("-");
  return {
    day: parseInt(intervalStrings[2]),
    month: parseInt(intervalStrings[1]),
    year: parseInt(intervalStrings[0]),
  };
};

/**
 * Adds a zero in front of the given number if it is less than 10. Note: this is
 * only for positive integers.
 * @param num A positive integer.
 * @returns A formatted positive integer.
 */
export const formatNumber = (num: number): string => {
  if (num < 0) {
    throw new Error("Number cannot be negative");
  }
  return num < 10 ? `0${num}` : `${num}`;
};
