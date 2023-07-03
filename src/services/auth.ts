import bcrypt from "bcrypt";
import { QueryConfig, QueryResult } from "pg";
import { pool } from "../config/database";
import { User } from "../models/User";
import { StatusError } from "../utils/StatusError";

export interface RegistrationDetails {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

export type LoginDetails = Pick<RegistrationDetails, "email" | "password">;

/**
 * Encrypts the given password.
 * @param password The password to be encrypted.
 * @returns The encrypted password.
 */
export const encryptPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Checks if a user with the given email already exists.
 * @param email The email address of a user trying to register.
 * @returns `true` if an account already exists with that email and `false` if
 * the email is not being used by another account.
 */
export const checkAccountExists = async (email: string): Promise<boolean> => {
  const query: QueryConfig = {
    text: "SELECT * FROM customer WHERE email = $1",
    values: [email],
  };
  const queryResult = await pool.query(query);
  return queryResult.rowCount > 0;
};

/**
 * Creates a new user in the database with the given user data.
 * @param registrationDetails The user's first name, last name, email, and
 * password.
 * @returns A user object with the given registration details.
 */
export const createUser = async (
  registrationDetails: RegistrationDetails
): Promise<User> => {
  const { firstName, lastName, email, password } = registrationDetails;
  const query: QueryConfig = {
    text: "INSERT INTO customer(first_name, last_name, email, password, is_admin) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    values: [firstName, lastName, email, password, false],
  };
  const queryResult = await pool.query(query);
  const newUser = getUserFromQueryResult(queryResult);
  return newUser;
};

/**
 * Gets a user from the database with the given email if a user with the given
 * email exists in the database.
 * @param email The email of the user trying to sign in.
 * @returns A user object with the given email.
 */
export const getUserFromEmail = async (email: string): Promise<User> => {
  const query: QueryConfig = {
    text: "SELECT * FROM customer WHERE email = $1",
    values: [email],
  };
  const queryResult = await pool.query(query);
  if (queryResult.rowCount < 1) {
    throw new StatusError(404, "User with email does not exist");
  }
  const newUser = getUserFromQueryResult(queryResult);
  return newUser;
};

/**
 * Extracts the relevant user data from the given query result object.
 * @param queryResult The query result from the Postgres query.
 * @returns A user object.
 * @throws Throws error if any part of the user cannot be extracted.
 */
export const getUserFromQueryResult = (queryResult: QueryResult): User => {
  const queryResultRow = queryResult.rows[0];
  const id = queryResultRow["id"];
  const firstName = queryResultRow["first_name"];
  const lastName = queryResultRow["last_name"];
  const email = queryResultRow["email"];
  const password = queryResultRow["password"];
  const isAdmin = queryResultRow["is_admin"] === "t" ? true : false;
  if (!id || !firstName || !lastName || !email || !password) {
    throw new Error("Could not retrieve user from database");
  }
  return { id, firstName, lastName, email, password, isAdmin };
};

/**
 * Checks if the hashed value of the given password matches the given hashed
 * password.
 * @param password The password being checked.
 * @param hashedPassword The hashed password the user has.
 * @returns `true` if the password is valid and `false` if the password is not
 * valid.
 */
export const validatePassword = async (
  password: string,
  hashedPassword: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
