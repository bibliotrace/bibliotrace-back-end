abstract class Response<T> {
  _message: string;
  _statusCode: number;
  _object: T;

  constructor(message: string, statusCode: number, object?: T) {
    this._message = message;
    this._statusCode = statusCode;
    if (object) this._object = object;
  }

  get message(): string {
    return this._message;
  }

  set message(message: string) {
    this._message = message;
  }

  get statusCode(): number {
    return this._statusCode;
  }

  set statusCode(statusCode: number) {
    this._statusCode = statusCode;
  }

  get object(): T {
    return this._object;
  }

  set object(object: T) {
    this._object = object;
  }
}

export default Response;
