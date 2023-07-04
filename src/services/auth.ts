import bcrypt from "bcrypt";
import { QueryConfig } from "pg";
import { pool } from "../database";
import { User } from "../models/User";
import { StatusError } from "../utils/StatusError";
import { getUserFromQueryResult } from "../utils/auth";

export type RegistrationPayload = Omit<User, "id" | "isAdmin">;

export type LoginPayload = Pick<RegistrationPayload, "email" | "password">;

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
 * @param registrationPayload The user's first name, last name, email, and
 * password.
 * @returns A user object with the given registration details.
 */
export const createUser = async (
  registrationPayload: RegistrationPayload
): Promise<User> => {
  const { firstName, lastName, email, password } = registrationPayload;
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
