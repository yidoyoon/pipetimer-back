import { Timer } from '@/timers/domain/timer.model';

export interface ITimerRepository {
  fetchTimer: (id: string) => Promise<Timer[]>;
  saveTimer: (id: string, timer: Timer[]) => Promise<any>;
}
