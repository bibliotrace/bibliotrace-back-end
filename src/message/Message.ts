interface Message {
  _message: string;
  get message(): string;
  set message(message: string);
}

export default Message;

export function isMessage(obj: any): obj is Message {
  return obj && typeof obj.message === "string";
}
