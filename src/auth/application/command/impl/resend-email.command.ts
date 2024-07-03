import { ICommand } from '@nestjs/cqrs';

export class ResendEmailCommand implements ICommand {
  constructor(readonly email: string) {}
}
