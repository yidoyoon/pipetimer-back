import { ICommand } from '@nestjs/cqrs';

export class VerifyChangeEmailTokenCommand implements ICommand {
  constructor(readonly changeEmailToken: string) {}
}
