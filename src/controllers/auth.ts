import { Request, Response } from "express";
import {
  RegistrationDetails,
  checkAccountExists,
  createUser,
  encryptPassword,
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
    const encryptedPassword = await encryptPassword(password);
    const accountExists = await checkAccountExists(email);
    if (accountExists) {
      throw new StatusError(400, "Account with provided email already exists");
    }
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
