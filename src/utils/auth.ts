import { Request } from "express";
import { QueryConfig, QueryResult } from "pg";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { pool } from "../database";

interface TokenPayload {
  id: number;
  email: string;
}

/**
 * Generates a token from the given user data.
 * @param user A user model object.
 * @returns A JWT token.
 */
export const generateTokenFromUser = (user: User): string => {
  const payload: TokenPayload = { id: user.id, email: user.email };
  const secret = getUserSecret(user);
  const token = generateToken(payload, secret);
  return token;
};

/**
 * Generates a secret based on a secret variable and the user's email.
 * @param user A user model object.
 * @returns A secret string.
 */
const getUserSecret = (user: User): string => {
  return process.env.JWT_SALT + user.email;
};

/**
 * Generates a JWT token with the given payload and secret which expires in 7
 * days.
 * @param payload The payload to be used in the token.
 * @param secret The secret to be used in the token.
 * @returns A JWT token that expires in 7 days.
 */
const generateToken = (payload: TokenPayload, secret: string): string => {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

/**
 * Checks if the incoming request is valid by checking if the token is valid and
 * matches the user ID in the request body.
 * @param req The incoming request.
 * @returns `true` if the user making the request has a valid token and ID,
 * `false` otherwise.
 */
export const isAuthorised = (req: Request): boolean => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return false;
  }
  const token = extractTokenFromHeader(authHeader);
  const decodedToken = jwt.decode(token, {
    complete: true,
  });
  const payload = decodedToken?.payload as jwt.JwtPayload;
  if (payload.exp && isTokenExpired(payload.exp)) {
    return false;
  }
  const userId = req.body.userId;
  return userId === parseInt(payload.id);
};

/**
 * Extracts the actual token from the given authorization header.
 * @param authHeader The authorization header from an incoming request.
 * @returns The token.
 */
export const extractTokenFromHeader = (authHeader: string): string => {
  return authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : authHeader;
};

/**
 * Checks if the given token's expiry time is in the past.
 * @param expiryTime The expiry time of the token.
 * @returns `true` if the token is expired and `false` if it is not.
 */
export const isTokenExpired = (expiryTime: number): boolean => {
  return expiryTime < new Date().getTime() / 1000;
};

/**
 * Gets the user with the given ID from the database.
 * @param id The ID of the user.
 * @returns The user with the given ID.
 */
export const getUserFromId = async (id: number): Promise<User> => {
  const query: QueryConfig = {
    text: "SELECT * FROM customer WHERE id = $1",
    values: [id],
  };
  const queryResult = await pool.query(query);
  const user = getUserFromQueryResult(queryResult);
  return user;
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
  const isAdmin = queryResultRow["is_admin"];
  if (!id || !firstName || !lastName || !email || !password
    || isAdmin === undefined) {
    throw new Error("Could not retrieve user from database");
  }
  return { id, firstName, lastName, email, password, isAdmin };
};
