import { ICommand } from '@nestjs/cqrs';

export class ChangeNameCommand implements ICommand {
  constructor(readonly email: string, readonly newName: string) {}
}
