import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { GetRoutineCommand } from '@/routines/application/command/impl/get-routine.command';
import { IRoutineRepository } from '@/routines/domain/iroutine.repository';

@Injectable()
@CommandHandler(GetRoutineCommand)
export class GetRoutineHandler implements ICommandHandler<GetRoutineCommand> {
  constructor(
    @Inject('RoutineRepository')
    private routineRepository: IRoutineRepository
  ) {}
  async execute(command: GetRoutineCommand) {
    const { id } = command;

    return await this.routineRepository.fetchRoutine(id);
  }
}
