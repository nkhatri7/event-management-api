import { Request, Response } from "express";
import {
  LoginDetails,
  RegistrationDetails,
  checkAccountExists,
  createUser,
  encryptPassword,
  getUserFromEmail,
  validatePassword,
} from "../services/auth";
import { generateTokenFromUser } from "../utils/auth";
import { StatusError } from "../utils/StatusError";

export const handleRegistration = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
    }: RegistrationDetails = req.body;
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
  } catch (err: any) {
    console.log(err);
    res.status(err.status || 500).json(err.message || err);
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password }: LoginDetails = req.body;
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
  } catch (err: any) {
    console.log(err);
    res.status(err.status || 500).json(err.message || err);
  }
};
