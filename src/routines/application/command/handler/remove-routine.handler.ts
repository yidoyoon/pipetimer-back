import { Inject, Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { RemoveRoutineCommand } from '@/routines/application/command/impl/remove-routine.command';
import { RoutineRepository } from '@/routines/infra/db/repository/routine.repository';

@Injectable()
@CommandHandler(RemoveRoutineCommand)
export class RemoveRoutineHandler
  implements ICommandHandler<RemoveRoutineCommand>
{
  constructor(
    @Inject('RoutineRepository')
    private routineRepository: RoutineRepository
  ) {}

  async execute(command: RemoveRoutineCommand) {
    const { id } = command;

    return await this.routineRepository.removeRoutine(id);
  }
}
