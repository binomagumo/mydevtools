export type ApiErrorResponse = {
  error?: string;
  message?: string;
};

export type JsonResultResponse = {
  result?: string;
};

export type JsonValidateResponse = {
  valid?: boolean;
  error?: string;
  message?: string;
};

export type HashResultResponse = {
  result?: string;
  algorithm?: string;
};

export type UuidResultResponse = {
  result?: string;
};

export type JwtDecodeResponse = {
  header?: Record<string, unknown>;
  payload?: Record<string, unknown>;
  issuedAt?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
};

export type HashAlgorithm = "SHA256" | "SHA384" | "SHA512";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}
