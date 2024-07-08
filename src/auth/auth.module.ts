import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthService } from '@/auth/application/auth.service';
import { CheckDuplicateEmailHandler } from '@/auth/application/query/handlers/check-duplicate-email.handler';
import { CheckDuplicateNameHandler } from '@/auth/application/query/handlers/check-duplicate-name.handler';
import { GetUserByEmailHandler } from '@/auth/application/query/handlers/get-user-by-email.handler';
import { GetUserByIdHandler } from '@/auth/application/query/handlers/get-user-by-id.handler';
import { AuthController } from '@/auth/interface/auth.controller';
import { JwtStrategy } from '@/auth/interface/strategy/jwt.strategy';
import { LocalStrategy } from '@/auth/interface/strategy/local.strategy';
import { RefreshTokenStrategy } from '@/auth/interface/strategy/refresh-token.strategy';
import { AuthSerializer } from '@/auth/serialization.provider';
import { EmailModule } from '@/email/email.module';
import { RedisModule } from '@/redis/redis.module';
import { RedisTokenService } from '@/redis/redis-token.service';
import { RoutineEntity } from '@/routines/infra/db/entity/routine.entity';
import { RoutineToTimerEntity } from '@/routines/infra/db/entity/routine-to-timer.entity';
import { RoutineRepository } from '@/routines/infra/db/repository/routine.repository';
import { UserFactory } from '@/users/domain/user.factory';
import { EmailAdapter } from '@/users/infra/adapter/email.adapter';
import { UserEntity } from '@/users/infra/db/entity/user.entity';
import { UserRepository } from '@/users/infra/db/repository/user.repository';
import { RedisTokenStrategy } from '@/users/interface/strategy/redis-token.strategy';

const CommandHandlers = [CheckDuplicateEmailHandler];
const QueryHandlers = [
  GetUserByIdHandler,
  CheckDuplicateNameHandler,
  GetUserByEmailHandler,
];
const EventHandlers = [];

const externalService = [
  EmailAdapter,
  { provide: 'RedisTokenService', useClass: RedisTokenService },
];

const strategies = [
  LocalStrategy,
  JwtStrategy,
  RefreshTokenStrategy,
  RedisTokenStrategy,
];

const repositories = [
  { provide: 'RoutineRepository', useClass: RoutineRepository },
  { provide: 'UserRepository', useClass: UserRepository },
];

const factories = [UserFactory];

@Module({
  imports: [
    CqrsModule,
    EmailModule,
    PassportModule.register({ session: true }),
    TypeOrmModule.forFeature([UserEntity, RoutineEntity, RoutineToTimerEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRESIN },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [
    ...CommandHandlers,
    ...EventHandlers,
    ...QueryHandlers,
    ...externalService,
    ...strategies,
    ...factories,
    ...repositories,
    AuthSerializer,
    AuthService,
    Logger,
    RedisTokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
