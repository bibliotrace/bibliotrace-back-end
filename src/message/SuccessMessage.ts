import Message from "./Message";

class SuccessMessage implements Message {
  _message: string;

  constructor(message: string) {
    this._message = message;
  }

  get message(): string {
    return this._message;
  }

  set message(message: string) {
    this._message = message;
  }
}

export default SuccessMessage;
