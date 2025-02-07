interface Message {
  _message: string;
  get message(): string;
  set message(message: string);
}

export default Message;
