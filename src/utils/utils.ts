import Response from "../response/Response";

export function validateUserType(req, res, type: string): boolean {
  if (req.auth.userRole.roleType !== type) {
    res.status(401).send({ message: `Improper Caller RoleType, required type is ${type}` });
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
