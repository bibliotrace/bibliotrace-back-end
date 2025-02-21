import Response from "./Response";

class ServerErrorResponse<T = string> extends Response<T> {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode);
  }
}

export default ServerErrorResponse;
