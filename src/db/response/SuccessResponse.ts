import Response from "./Response";

class SuccessResponse<T = any> extends Response<T> {
  constructor(message: string, object?: T) {
    super(message, 200, object);
  }
}
export default SuccessResponse;
