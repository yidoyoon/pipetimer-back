import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SaveTimerCommand } from '@/timers/application/command/impl/save-timer.command';
import { ITimerRepository } from '@/timers/domain/itimer.repository';

@Injectable()
@CommandHandler(SaveTimerCommand)
export class SaveTimerHandler implements ICommandHandler<SaveTimerCommand> {
  constructor(
    @Inject('TimerRepository')
    private timerRepository: ITimerRepository
  ) {}
  async execute(command: SaveTimerCommand) {
    const { id, timer } = command;

    return await this.timerRepository.saveTimer(id, timer);
  }
}
