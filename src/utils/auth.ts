import { User } from "../models/User";
import jwt from "jsonwebtoken";

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
