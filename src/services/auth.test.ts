import { Pool } from "pg";
import {
  checkAccountExists,
  createUser,
  encryptPassword,
  getUserFromEmail,
  validatePassword,
} from "./auth";
import { getMockQueryResult } from "../mocks/database";
import { User } from "../models/User";

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

describe("checkAccountExists", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return false when a user with the email doesn't exist", async () => {
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    expect(await checkAccountExists("test@example.com")).toBe(false);
  });

  it("Should return true when a user with the email exists", async () => {
    const userEmail = "test@example.com";
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "test first name",
        last_name: "test last name",
        email: userEmail,
        password: "supersecurepassword",
        is_admin: false,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    expect(await checkAccountExists(userEmail)).toBe(true);
  });
});

describe("createUser", () => {
  it("Should return the given data with an ID", async () => {
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
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    const newUser: User = {
      id: 1,
      firstName: "test first name",
      lastName: "test last name",
      email: "test@example.com",
      password: "supersecurepassword",
      isAdmin: false,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, isAdmin, ...registrationData } = newUser;
    expect(await createUser(registrationData)).toEqual(newUser);
  });
});

describe("getUserFromEmail", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return a user object with the given email if an account with the email is found", async () => {
    const userEmail = "userexists@example.com";
    const mockQueryResult = getMockQueryResult([
      {
        id: 1,
        first_name: "some first name",
        last_name: "some last name",
        email: userEmail,
        password: "hashedpassword",
        is_admin: false,
      },
    ]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    const expectedResult: User = {
      id: 1,
      firstName: "some first name",
      lastName: "some last name",
      email: userEmail,
      password: "hashedpassword",
      isAdmin: false,
    };
    expect(await getUserFromEmail(userEmail)).toEqual(expectedResult);
  });

  it("Should throw an error if a user with the given email doesn't exist", async () => {
    const userEmail = "userdoesnotexist@example.com";
    const mockQueryResult = getMockQueryResult([]);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);
    expect(async () => await getUserFromEmail(userEmail))
      .rejects
      .toThrowError();
  });
});

describe("encryptPassword", () => {
  it("Should return a random string when given securepassword", async () => {
    const userPassword = "securepassword";
    const hashedPassword = await encryptPassword(userPassword);
    expect(hashedPassword).not.toBe(userPassword);
    expect(hashedPassword).not.toContain(userPassword);
  });

  it("Should return a random string when given anothersecurepassword", async () => {
    const userPassword = "anothersecurepassword";
    const hashedPassword = await encryptPassword(userPassword);
    expect(hashedPassword).not.toBe(userPassword);
    expect(hashedPassword).not.toContain(userPassword);
  });
});

describe("validatePassword", () => {
  it("Should return true when the given password is the unhashed version of the hashed password", async () => {
    const userPassword = "securepassword";
    const hashedPassword = await encryptPassword(userPassword);
    expect(await validatePassword(userPassword, hashedPassword)).toBe(true);
  });

  it("Should return false when the given password is not the unhashed version of the hashed password", async () => {
    const givenPassword = "securepassword";
    const actualPassword = "supersecurepassword";
    const hashedPassword = await encryptPassword(actualPassword);
    expect(await validatePassword(givenPassword, hashedPassword)).toBe(false);
  });
});
