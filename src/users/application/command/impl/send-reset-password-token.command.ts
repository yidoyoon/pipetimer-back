import { ICommand } from '@nestjs/cqrs';

export class SendResetPasswordTokenCommand implements ICommand {
  constructor(readonly email: string) {}
}
