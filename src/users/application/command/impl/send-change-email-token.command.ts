import { ICommand } from '@nestjs/cqrs';

export class SendChangeEmailTokenCommand implements ICommand {
  constructor(readonly oldEmail: string, readonly newEmail: string) {}
}
