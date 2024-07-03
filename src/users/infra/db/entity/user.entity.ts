import * as argon2 from '@node-rs/argon2';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ulid } from 'ulid';

import { Routine } from '@/routines/domain/routine.model';
import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { Timer } from '@/timers/domain/timer.model';
import { TimerEntity } from '@/timers/infra/db/entity/timer.entity';

@Entity('User')
export class UserEntity {
  @PrimaryColumn({ unique: true })
  id: string;

  @Column({ unique: true, length: 320 })
  email: string;

  @Column({ unique: true, length: 39 })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  signupToken: string;

  @Column({ nullable: true, default: null })
  resetPasswordToken: string;

  @Column({ nullable: true, default: null })
  changeEmailToken: string;

  @Column({ nullable: true, default: null })
  newEmail: string;

  @Column({ default: 0 })
  todayTotal: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    this.password = await argon2.hash(this.password);
  }

  @OneToMany(() => TimerEntity, (timerEntity) => timerEntity.user)
  timer: Timer[];

  @OneToMany(() => RoutineEntity, (routineEntity) => routineEntity.user)
  routine: Routine[];

  constructor(p: Partial<UserEntity> = {}) {
    this.id = p.id || ulid();
    this.email = p.email || '';
    this.username = p.username || '';
    this.password = p.password || '';
    this.signupToken = p.signupToken || null;
    this.resetPasswordToken = p.resetPasswordToken || null;
    this.changeEmailToken = p.changeEmailToken || null;
    this.newEmail = p.newEmail || null;
    this.createdAt = p.createdAt || new Date();
    this.updatedAt = p.updatedAt || new Date();
    this.timer = p.timer || null;
    this.routine = p.routine || null;

    Object.assign(this, p);
  }
}
