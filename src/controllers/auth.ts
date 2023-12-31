import { Request, Response } from "express";
import {
  LoginPayload,
  RegistrationPayload,
  checkAccountExists,
  createUser,
  encryptPassword,
  getUserFromEmail,
  validatePassword,
} from "../services/auth";
import { safeHandler } from "../middleware/wrapper";
import { generateTokenFromUser } from "../utils/auth";
import { StatusError } from "../utils/StatusError";

export const handleRegistration = safeHandler(
  async (req: Request, res: Response) => {
    const {
      firstName,
      lastName,
      email,
      password,
    }: RegistrationPayload = req.body;
    if (!firstName || !lastName || !email || !password) {
      throw new StatusError(400, "Missing registration details");
    }
    const accountExists = await checkAccountExists(email);
    if (accountExists) {
      throw new StatusError(400, "Account with provided email already exists");
    }
    const encryptedPassword = await encryptPassword(password);
    const user = await createUser({
      firstName,
      lastName,
      email,
      password: encryptedPassword,
    });
    const token = generateTokenFromUser(user);
    res.status(201).json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      token,
    });
  }
);

export const handleLogin = safeHandler(async (req: Request, res: Response) => {
  const { email, password }: LoginPayload = req.body;
  if (!email || !password) {
    throw new StatusError(400, "Missing email or password");
  }
  const user = await getUserFromEmail(email);
  const isPasswordValid = await validatePassword(password, user.password);
  if (!isPasswordValid) {
    throw new StatusError(401, "Password is incorrect");
  }
  const token = generateTokenFromUser(user);
  res.status(200).json({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    token,
  });
});
