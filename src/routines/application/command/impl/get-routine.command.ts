import { ICommand } from '@nestjs/cqrs';

export class GetRoutineCommand implements ICommand {
  constructor(readonly id: string) {}
}
