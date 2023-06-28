import { genSalt, hash } from "bcrypt";
import { QueryConfig, QueryResult } from "pg";
import { pool } from "../config/database";
import { User } from "../models/User";

export interface RegistrationDetails {
  firstName: string | undefined;
  lastName: string | undefined;
  email: string | undefined;
  password: string | undefined;
}

/**
 * Encrypts the given password.
 * @param password The password to be encrypted.
 * @returns The encrypted password.
 */
export const encryptPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(password, salt);
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
  const response = await pool.query(query);
  return response.rowCount > 0;
};

/**
 * Creates a new user in the database with the given user data.
 * @param registrationDetails The user's first name, last name, email, and
 * password.
 * @returns The user ID of the new user from the database.
 */
export const createUser = async (
  registrationDetails: RegistrationDetails
): Promise<User> => {
  const { firstName, lastName, email, password } = registrationDetails;
  const query: QueryConfig = {
    text: "INSERT INTO customer(first_name, last_name, email, password) VALUES ($1, $2, $3, $4) RETURNING *",
    values: [firstName, lastName, email, password],
  };
  const queryResult = await pool.query(query);
  const newUser = getUserFromQueryResult(queryResult);
  return newUser;
};

/**
 * Extracts the relevant user data from the given query result object.
 * @param queryResult The query result from the Postgres query.
 * @returns A user object.
 */
const getUserFromQueryResult = (queryResult: QueryResult): User => {
  const queryResultRow = queryResult.rows[0];
  const id = queryResultRow["id"];
  const firstName = queryResultRow["first_name"];
  const lastName = queryResultRow["last_name"];
  const email = queryResultRow["email"];
  const password = queryResultRow["password"];
  if (!id || !firstName || !lastName || !email || !password) {
    throw new Error("Could not create user properly");
  }
  return { id, firstName, lastName, email, password };
};
