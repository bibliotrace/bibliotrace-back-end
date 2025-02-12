import Response from "./Response";

class RequestErrorResponse<T = any> extends Response<T> {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
  }
}

export default RequestErrorResponse;
