import { Request } from "express";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import {
  extractTokenFromHeader,
  getUserFromId,
  getUserFromQueryResult,
  isAuthenticated,
  isTokenExpired,
} from "./auth";
import { getMockQueryResult } from "../mocks/database";
import { User } from "../models/User";

jest.mock("jsonwebtoken", () => {
  return {
    decode: jest.fn(),
  };
});

jest.mock("pg", () => {
  const mockPool = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn()
  };

  return {
    Pool: jest.fn(() => mockPool),
    QueryResult: jest.requireActual("pg").QueryResult,
  };
});

const ONE_WEEK = 7 * 24 * 60 * 60;

describe("isAuthenticated", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return false if there is no authorisation header", () => {
    const mockRequest = {
      headers: {},
      body: {},
    } as Request;
    expect(isAuthenticated(mockRequest)).toBe(false);
  });

  it("Should return false if the token is expired", () => {
    const mockToken = "somejwttoken";
    const mockRequest = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {},
    } as Request;
    const mockJwtObject: jwt.Jwt = {
      header: { alg: "" },
      payload: { exp: (new Date().getTime() / 1000) - ONE_WEEK },
      signature: "",
    };
    (jwt.decode as jest.Mock).mockReturnValue(mockJwtObject);
    expect(isAuthenticated(mockRequest)).toBe(false);
  });

  it("Should return false if the user ID from the jwt payload doesn't match the given user ID", () => {
    const mockToken = "somejwttoken";
    const mockRequest = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        userId: 1,
      },
    } as Request;
    const mockJwtObject: jwt.Jwt = {
      header: { alg: "" },
      payload: { exp: (new Date().getTime() / 1000) + ONE_WEEK, id: 2 },
      signature: "",
    };
    (jwt.decode as jest.Mock).mockReturnValue(mockJwtObject);
    expect(isAuthenticated(mockRequest)).toBe(false);
  });

  it("Should return true if the token isn't expired and the given user ID from the request body matches the ID in the jwt payload", () => {
    const mockToken = "somejwttoken";
    const userId = 1;
    const mockRequest = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      body: {
        userId,
      },
    } as Request;
    const mockJwtObject: jwt.Jwt = {
      header: { alg: "" },
      payload: { exp: (new Date().getTime() / 1000) + ONE_WEEK, id: userId },
      signature: "",
    };
    (jwt.decode as jest.Mock).mockReturnValue(mockJwtObject);
    expect(isAuthenticated(mockRequest)).toBe(true);
  });

  it("Should return true if the token isn't expired and the given user ID from the request query params matches the ID in the jwt payload", () => {
    const mockToken = "somejwttoken";
    const userId = 1;
    const mockRequest: Partial<Request> = {
      headers: {
        authorization: `Bearer ${mockToken}`,
      },
      query: {
        uid: "1",
      },
    };
    const mockJwtObject: jwt.Jwt = {
      header: { alg: "" },
      payload: { exp: (new Date().getTime() / 1000) + ONE_WEEK, id: userId },
      signature: "",
    };
    (jwt.decode as jest.Mock).mockReturnValue(mockJwtObject);
    expect(isAuthenticated(mockRequest as Request)).toBe(true);
  });
});

describe("extractTokenFromHeader", () => {
  it("Should extract the token if the authorization header starts with 'Bearer'", () => {
    const token = "somejwttoken";
    expect(extractTokenFromHeader(`Bearer ${token}`)).toBe(token);
  });

  it("Should return the same string from the authorisation header if it doesn't start with 'Bearer'", () => {
    const token = "somejwttokenwithoutbearer";
    expect(extractTokenFromHeader(token)).toBe(token);
  });
});

describe("isTokenExpired", () => {
  it("Should return false if the expiration time is in the future", () => {
    const expirationTime = (new Date().getTime() / 1000) + ONE_WEEK;
    expect(isTokenExpired(expirationTime)).toBe(false);
  });

  it("Should return true if the expiration time is in the past", () => {
    const expirationTime = (new Date().getTime() / 1000) - ONE_WEEK;
    expect(isTokenExpired(expirationTime)).toBe(true);
  });
});

describe("getUserFromId", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return a user with the given ID", async () => {
    const userId = 1;
    const mockQueryResult = getMockQueryResult([
      {
        id: userId,
        first_name: "test first name",
        last_name: "test last name",
        email: "test@example.com",
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    const user: User = {
      id: userId,
      firstName: "test first name",
      lastName: "test last name",
      email: "test@example.com",
      password: "supersecurepassword",
      isAdmin: false,
    };

    expect(await getUserFromId(userId)).toEqual(user);
  });
});

describe("getUserFromQueryResult", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an ID, first name, last name, email, password, and isAdmin from the query result", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        last_name: "test last name",
        email: "test@example.com",
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    const expectedResult: User = {
      id: 1,
      firstName: "test first name",
      lastName: "test last name",
      email: "test@example.com",
      password: "supersecurepassword",
      isAdmin: false,
    };
    expect(getUserFromQueryResult(mockQueryResult)).toEqual(expectedResult);
  });

  it("Should throw an error if the ID cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        first_name: "test first name",
        last_name: "test last name",
        email: "test@example.com",
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the first name cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        last_name: "test last name",
        email: "test@example.com",
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the last name cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        email: "test@example.com",
        password: "supersecurepassword",
        isAdmin: false,
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the email cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        last_name: "test last name",
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the password cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        last_name: "test last name",
        email: "test@example.com",
        is_admin: false,
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if isAdmin cannot be found", () => {
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        last_name: "test last name",
        email: "test@example.com",
        password: "supersecurepassword",
      },
    ]);
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });
});