import { ICommand } from '@nestjs/cqrs';

import { Routine } from '@/routines/domain/routine.model';

export class SaveRoutineCommand implements ICommand {
  constructor(readonly id: string, readonly routine: Routine) {}
}
