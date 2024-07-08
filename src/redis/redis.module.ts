import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import Redis from 'ioredis';

import { EmailModule } from '@/email/email.module';
import { RedisAuthService } from '@/redis/redis-auth.service';
import { RedisTimerSocketService } from '@/redis/redis-timer-socket.service';
import { RedisTokenService } from '@/redis/redis-token.service';
import { RedisTokenPubSubService } from '@/redis/redis-token-pub-sub.service';
import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { DeleteUserHandler } from '@/users/application/command/handlers/delete-user.handler';
import { UserFactory } from '@/users/domain/user.factory';
import { EmailAdapter } from '@/users/infra/adapter/email.adapter';
import { UserEntity } from '@/users/infra/db/entity/user.entity';
import { UserRepository } from '@/users/infra/db/repository/user.repository';

import {
  REDIS_AUTH,
  REDIS_SUB,
  REDIS_TIMER_SOCKET,
  REDIS_TOKEN,
} from './redis.constants';

const externalService = [EmailAdapter];
const repositories = [{ provide: 'UserRepository', useClass: UserRepository }];
const commandHandlers = [DeleteUserHandler];
const factories = [UserFactory];

async function createRedisClient(): Promise<Redis> {
  const client = new Redis({
    host: process.env.REDIS_BASE_URL,
    port:
      process.env.TEST === 'true'
        ? +process.env.REDIS_TEST_PORT
        : +process.env.REDIS_PORT,
  });

  return client;
}

@Module({
  imports: [
    CqrsModule,
    EmailModule,
    TypeOrmModule.forFeature([UserEntity, RoutineEntity, RoutineToTimerEntity]),
  ],
  providers: [
    {
      provide: REDIS_AUTH,
      useFactory: createRedisClient,
    },
    {
      provide: REDIS_TOKEN,
      useFactory: createRedisClient,
    },
    {
      provide: REDIS_SUB,
      useFactory: createRedisClient,
    },
    {
      provide: REDIS_TIMER_SOCKET,
      useFactory: createRedisClient,
    },
    ...commandHandlers,
    ...externalService,
    ...factories,
    ...repositories,
    Logger,
    RedisTokenService,
    RedisTokenPubSubService,
    RedisTimerSocketService,
    RedisAuthService,
  ],
  exports: [
    REDIS_AUTH,
    REDIS_TOKEN,
    REDIS_SUB,
    REDIS_TIMER_SOCKET,
    RedisTokenService,
    RedisTokenPubSubService,
    RedisTimerSocketService,
    RedisAuthService,
  ],
})
export class RedisModule {}
