// Declare specific errors.

// FastlyAPIError raises when Fastly API responds error.
export class FastlyAPIError extends Error {}

// InvalidDateRangeError raises when request parameter is invalid.
export class InvalidDateRangeError extends Error {}
