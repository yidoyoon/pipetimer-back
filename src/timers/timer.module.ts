import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '@/auth/auth.module';
import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { GetTimerHandler } from '@/timers/application/command/handler/get-timer.handler';
import { SaveTimerHandler } from '@/timers/application/command/handler/save-timer.handler';
import { TimerEntity } from '@/timers/infra/db/entity/timer.entity';
import { TimerRepository } from '@/timers/infra/db/repository/timer.repository';
import { TimerController } from '@/timers/interface/timer.controller';

const commandHandlers = [GetTimerHandler, SaveTimerHandler];
const queryHandlers = [];
const eventHandlers = [];
const factories = [];

const repositories = [
  { provide: 'TimerRepository', useClass: TimerRepository },
];

@Module({
  imports: [
    AuthModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      TimerEntity,
      RoutineToTimerEntity,
      RoutineEntity,
    ]),
    PassportModule.register({
      session: true,
    }),
  ],
  controllers: [TimerController],
  providers: [
    ...commandHandlers,
    ...eventHandlers,
    ...factories,
    ...queryHandlers,
    ...repositories,
    Logger,
  ],
})
export class TimerModule {}
