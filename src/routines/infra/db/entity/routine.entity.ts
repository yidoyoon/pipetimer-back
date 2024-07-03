import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  RelationId,
} from 'typeorm';

import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { UserEntity } from '@/users/infra/db/entity/user.entity';

@Entity('Routine')
export class RoutineEntity extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  count: number;

  @CreateDateColumn({ select: false })
  createdAt: Date;

  @CreateDateColumn({ select: false })
  updatedAt: Date;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.routine, {
    onDelete: 'CASCADE',
  })
  user: UserEntity;

  @RelationId((routineEntity: RoutineEntity) => routineEntity.user)
  @Column({ nullable: true, select: false })
  userId: string;

  @OneToMany(
    () => RoutineToTimerEntity,
    (routineToTimer) => routineToTimer.routine,
    {
      cascade: true,
    }
  )
  routineToTimer: RoutineToTimerEntity[];
}
