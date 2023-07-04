import { Request, Response } from "express";
import { handleLogin, handleRegistration } from "./auth";
import * as authService from "../services/auth";
import * as authUtils from "../utils/auth";
import { User } from "../models/User";

jest.mock("../services/auth");
jest.mock("../utils/auth");

describe("handleRegistration", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should send a status code of 400 when the first name is not in the request body", async () => {
    const mockRequest = {
      body: {
        lastName: "some last name",
        email: "test@example.com",
        password: "securepassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the last name is not in the request body", async () => {
    const mockRequest = {
      body: {
        firstName: "some first name",
        email: "test@example.com",
        password: "securepassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the email is not in the request body", async () => {
    const mockRequest = {
      body: {
        firstName: "some first name",
        lastName: "some last name",
        password: "securepassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when the password is not in the request body", async () => {
    const mockRequest = {
      body: {
        firstName: "some first name",
        lastName: "some last name",
        email: "test@example.com",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 400 when if an account with the given email exists", async () => {
    const mockRequest = {
      body: {
        firstName: "some first name",
        lastName: "some last name",
        email: "test@example.com",
        password: "securepassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authService, "checkAccountExists").mockResolvedValue(true);
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should send a status code of 201 when the payload is fine and an account with the given email doesn't exist", async () => {
    const registrationPayload = {
      firstName: "some first name",
      lastName: "some last name",
      email: "test@example.com",
      password: "securepassword",
    };
    const mockRequest = {
      body: registrationPayload,
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authService, "checkAccountExists").mockResolvedValue(false);
    jest.spyOn(authService, "encryptPassword").mockResolvedValue("password");
    const newUser: User = {
      id: 1,
      isAdmin: false,
      ...registrationPayload,
    };
    jest.spyOn(authService, "createUser").mockResolvedValue(newUser);
    jest.spyOn(authUtils, "generateTokenFromUser").mockReturnValue("jwttoken");
    await handleRegistration(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(201);
  });
});

describe("handleLogin", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return a status code of 400 when the email is not in the request body", async () => {
    const mockRequest = {
      body: {
        password: "securepassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleLogin(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should return a status code of 400 when the password is not in the request body", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await handleLogin(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(400);
  });

  it("Should return a status code of 401 when the password is incorrect", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "incorrectpassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authService, "getUserFromEmail").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "first last name",
      email: "test@example.com",
      password: "correcthashedpassword",
      isAdmin: false,
    });
    await handleLogin(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(401);
  });

  it("Should return a status code of 200 when the email and password is correct", async () => {
    const mockRequest = {
      body: {
        email: "test@example.com",
        password: "correctpassword",
      }
    } as Request;
    const mockResponse: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.spyOn(authService, "getUserFromEmail").mockResolvedValue({
      id: 1,
      firstName: "some first name",
      lastName: "first last name",
      email: "test@example.com",
      password: "correcthashedpassword",
      isAdmin: false,
    });
    jest.spyOn(authService, "validatePassword").mockResolvedValue(true);
    await handleLogin(mockRequest, mockResponse as Response);
    expect(mockResponse.status).toBeCalledWith(200);
  });
});
