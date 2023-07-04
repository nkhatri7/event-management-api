import { QueryConfig, QueryResultRow } from "pg";
import { Venue } from "../models/Venue";
import { pool } from "../config/database";

export type VenuePayload = Omit<Venue, "id">;

/**
 * Creates a venue in the database with the given venue data.
 * @param venueData The capacity and hourly rate of the venue.
 * @returns A venue object with an ID and the given venue data.
 */
export const createVenue = async (
  venueData: VenuePayload
): Promise<Venue> => {
  const { name, address, postcode, state, capacity, hourlyRate } = venueData;
  const query: QueryConfig = {
    text: "INSERT INTO venue(name, address, postcode, state, capacity, hourly_rate) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    values: [name, address, postcode, state, capacity, hourlyRate],
  };
  const queryResult = await pool.query(query);
  const newVenue = getVenueFromQueryResultRow(queryResult.rows[0]);
  return newVenue;
};

/**
 * Extracts the relevant venue data from the given query result row.
 * @param queryResultRow A row from the query result.
 * @returns A venue object with the data from the query result row.
 */
export const getVenueFromQueryResultRow = (
  queryResultRow: QueryResultRow
): Venue => {
  const id = queryResultRow["id"];
  const name = queryResultRow["name"];
  const address = queryResultRow["address"];
  const postcode = queryResultRow["postcode"];
  const state = queryResultRow["state"];
  const capacity = queryResultRow["capacity"];
  const hourlyRate = queryResultRow["hourly_rate"];
  if (!id || !name || !address || !postcode || !state || !capacity
      || !hourlyRate) {
    throw new Error("Could not receive venue from database");
  }
  return { id, name, address, postcode, state, capacity, hourlyRate };
};
