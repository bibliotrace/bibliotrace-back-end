import Response from "./Response";

class ServerErrorResponse<T = any> extends Response<T> {
  constructor(message: string, statusCode: number = 500) {
    super(message, statusCode);
  }
}

export default ServerErrorResponse;
