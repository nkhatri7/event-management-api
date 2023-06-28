export class StatusError extends Error {
  code: number;

  constructor(code: number, message: string) {
    super(message);
    this.name = "Status Error";
    this.code = code;
  }
}
