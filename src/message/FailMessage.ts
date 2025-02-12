import Message from "./Message";

class FailMessage implements Message {
  _message: string;
  private _errorCode: number;

  constructor(message: string, errorCode: number) {
    this._message = message;
    this._errorCode = errorCode;
  }

  get message(): string {
    return this._message;
  }

  set message(message: string) {
    this._message = message;
  }

  get errorCode(): number {
    return this._errorCode;
  }

  set errorCode(errorCode: number) {
    this._errorCode = errorCode;
  }
}

export default FailMessage;
