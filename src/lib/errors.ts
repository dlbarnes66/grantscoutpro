export class AppError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function throwIf(condition: boolean, message: string, status = 400) {
  if (condition) throw new AppError(message, status);
}
