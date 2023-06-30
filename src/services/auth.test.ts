import { Pool } from "pg";
import { checkAccountExists, createUser, encryptPassword, getUserFromQueryResult } from "./auth";
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
    const mockQueryResult = getMockQueryResult(0);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    expect(await checkAccountExists("test@example.com")).toBe(false);
  });

  it("Should return true when a user with the email exists", async () => {
    const mockQueryResult = getMockQueryResult(1);
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    expect(await checkAccountExists("test@example.com")).toBe(true);
  });
});

describe("createUser", () => {
  it("Should return the given data with an ID", async () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          first_name: "test first name",
          last_name: "test last name",
          email: "test@example.com",
          password: "supersecurepassword",
        },
      ]
    );
    const mockPool = new Pool();
    (mockPool.query as jest.Mock).mockResolvedValue(mockQueryResult);

    const newUser: User = {
      id: 1,
      firstName: "test first name",
      lastName: "test last name",
      email: "test@example.com",
      password: "supersecurepassword",
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...registrationData } = newUser;
    expect(await createUser(registrationData)).toEqual(newUser);
  });
});

describe("getUserFromQueryResult", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("Should return an ID, first name, last name, email and password from the query result", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          first_name: "test first name",
          last_name: "test last name",
          email: "test@example.com",
          password: "supersecurepassword",
        },
      ]
    );
    const expectedResult: User = {
      id: 1,
      firstName: "test first name",
      lastName: "test last name",
      email: "test@example.com",
      password: "supersecurepassword",
    };
    expect(getUserFromQueryResult(mockQueryResult)).toEqual(expectedResult);
  });

  it("Should throw an error if the ID cannot be found", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          first_name: "test first name",
          last_name: "test last name",
          email: "test@example.com",
          password: "supersecurepassword",
        },
      ]
    );
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the first name cannot be found", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          last_name: "test last name",
          email: "test@example.com",
          password: "supersecurepassword",
        },
      ]
    );
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the last name cannot be found", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          first_name: "test first name",
          email: "test@example.com",
          password: "supersecurepassword",
        },
      ]
    );
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the email cannot be found", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          first_name: "test first name",
          last_name: "test last name",
          password: "supersecurepassword",
        },
      ]
    );
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
  });

  it("Should throw an error if the password cannot be found", () => {
    const mockQueryResult = getMockQueryResult(
      1,
      [
        {
          id: 1,
          first_name: "test first name",
          last_name: "test last name",
          email: "test@example.com",
        },
      ]
    );
    expect(() => getUserFromQueryResult(mockQueryResult)).toThrowError();
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
