import { ICommand } from '@nestjs/cqrs';

export class GetTimerCommand implements ICommand {
  constructor(readonly id: string) {}
}
