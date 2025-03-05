import RequestErrorResponse from "../response/RequestErrorResponse";
import Response from "../response/Response";

export function validateUserType(req, res, type: string): boolean {
  if (req.auth.userRole.roleType !== type) {
    if (res != null) {
      res.status(401).send({ message: `Improper Caller RoleType, required type is ${type}` });
    }
    return false;
  }
  return true;
}

export function sendResponse(res, response: Response<any>): void {
  const responseBody = { message: response.message, object: null };
  if (response.object) {
    responseBody.object = response.object;
  }
  res.status(response.statusCode).send(responseBody);
}

export function isValidISBN(isbn: string): boolean {
  const isbnClean = isbn.replace(/[-\s]/g, ""); // Remove hyphens and spaces

  // Check if ISBN is ISBN-10
  if (isbnClean.length === 10) {
    const checkSum = isbnClean.split("").reduce((sum, char, index) => {
      const digit = char === "X" ? 10 : parseInt(char, 10);
      return sum + digit * (10 - index);
    }, 0);
    return checkSum % 11 === 0;
  }

  // Check if ISBN is ISBN-13
  if (isbnClean.length === 13) {
    const checkSum = isbnClean.split("").reduce((sum, char, index) => {
      const digit = parseInt(char, 10);
      return sum + (index % 2 === 0 ? digit : digit * 3);
    }, 0);
    return checkSum % 10 === 0;
  }

  return false; // Not a valid ISBN length
}

export function sanitizeISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, "");
}

export function parseQr(qr: string) {
  // TODO: figure out how the Access QR code is generated, this is just a placeholder
  if (
    !qr ||
    qr.length !== 6 ||
    !isAlphanumeric(qr) ||
    !isAlpha(qr.substring(0, 2)) ||
    !isNumeric(qr.substring(2))
  ) {
    return new RequestErrorResponse("Invalid QR code provided", 400);
  }
}

function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

function isNumeric(str: string): boolean {
  return /^[0-9]+$/.test(str);
}

export function parseRequiredFields(body, requiredFields: string[]): RequestErrorResponse {
  for (const field of requiredFields) {
    if (body[field] == null) {
      return new RequestErrorResponse(`Required field ${field} missing in request`, 400);
    }
  }

  return null;
}
