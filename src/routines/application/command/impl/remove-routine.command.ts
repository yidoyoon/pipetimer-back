import { ICommand } from '@nestjs/cqrs';

export class RemoveRoutineCommand implements ICommand {
  constructor(readonly id: string) {}
}
