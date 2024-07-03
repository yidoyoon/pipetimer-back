import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { TimerEntity } from '@/timers/infra/db/entity/timer.entity';

@Entity('RoutineToTimer')
export class RoutineToTimerEntity {
  @PrimaryColumn()
  routineToTimerId: string;

  @Column({ default: 0 })
  order: number;

  @Column({ select: false })
  timerId: string;

  @Column({ select: false })
  routineId: string;

  @ManyToOne(() => RoutineEntity, (routine) => routine.routineToTimer, {
    createForeignKeyConstraints: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'routineId', referencedColumnName: 'id' })
  routine: RoutineEntity;

  @ManyToOne(() => TimerEntity, (timer) => timer.routineToTimer, {
    createForeignKeyConstraints: false,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'timerId', referencedColumnName: 'timerId' })
  timer: TimerEntity;
}
