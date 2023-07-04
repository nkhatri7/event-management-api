import { Request, Response } from "express";

/**
 * Wraps a controller function in an asynchronous function and catches any
 * errors that arise within the function.
 * @param fn A controller function.
 * @returns A wrapped asynchronous function with error handling.
 */
export const safeHandler = (
  fn: (req: Request, res: Response) => Promise<void>
) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      if (process.env.NODE_ENV !== "test") {
        console.log(err);
      }
      res.status(err.code || 500).json(err.message || err);
    }
  };
};