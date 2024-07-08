import { Routine } from '@/routines/domain/routine.model';

export interface IRoutineRepository {
  fetchRoutine: (id: string) => Promise<Routine[]>;
  saveRoutine: (id: string, routine: Routine) => Promise<any>;
}
