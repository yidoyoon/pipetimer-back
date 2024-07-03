export interface EmailSender {
  send: (options: any) => Promise<void>;
}
