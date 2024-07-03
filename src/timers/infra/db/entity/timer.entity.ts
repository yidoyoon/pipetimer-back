import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { UserEntity } from '@/users/infra/db/entity/user.entity';

@Entity('Timer')
export class TimerEntity extends BaseEntity {
  @PrimaryColumn()
  timerId: string;

  @Column()
  name: string;

  @Column()
  duration: number;

  @Column()
  count: number;

  @Column()
  order: number;

  @Column()
  color: string;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @UpdateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.timer, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @RelationId((timerEntity: TimerEntity) => timerEntity.user)
  @Column({ nullable: true, select: false })
  userId: string;

  @OneToMany(
    () => RoutineToTimerEntity,
    (routineToTimer) => routineToTimer.timer,
    {
      cascade: true,
    }
  )
  routineToTimer: RoutineToTimerEntity[];
}
