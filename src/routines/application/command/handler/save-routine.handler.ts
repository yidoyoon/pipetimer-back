import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SaveRoutineCommand } from '@/routines/application/command/impl/save-routine.command';
import { IRoutineRepository } from '@/routines/domain/iroutine.repository';

@Injectable()
@CommandHandler(SaveRoutineCommand)
export class SaveRoutineHandler implements ICommandHandler<SaveRoutineCommand> {
  constructor(
    @Inject('RoutineRepository')
    private routineRepository: IRoutineRepository
  ) {}
  async execute(command: SaveRoutineCommand) {
    const { id, routine } = command;

    return await this.routineRepository.saveRoutine(id, routine);
  }
}
