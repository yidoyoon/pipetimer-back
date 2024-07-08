import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { DeleteResult, UpdateResult } from 'typeorm';

import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
export class RedisTokenPubSubService {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository,
    private logger: Logger
  ) {
    const tokenList = ['signupToken', 'changeEmailToken', 'resetPasswordToken'];

    const client = new Redis({
      host: process.env.REDIS_BASE_URL,
      port:
        process.env.TEST === 'true'
          ? +process.env.REDIS_TEST_PORT
          : +process.env.REDIS_PORT,
    });

    this.setRedisTokenNotify(client, 'Ex');
    this.subRedisToken(client, '__keyevent@0__:expired', tokenList);
  }

  private setRedisTokenNotify(client: Redis, option: string): void {
    if (process.env.NODE_ENV === 'development') {
      client.config('SET', 'notify-keyspace-events', option);
    }
  }

  private subRedisToken(
    client: Redis,
    message: string,
    eventList: string[]
  ): void {
    client.subscribe(message);

    client.on('message', async (channel, key): Promise<void> => {
      if (channel === message) {
        const [event, token] = key.split(':');

        if (eventList.includes(event)) {
          const result = await this.expireToken(event, token);
          if (result === null) {
            this.logger.error(`Cannot expire token. ${event}:${token}`);
          }

          this.logger.verbose(`Token expired. ${event}:${token}`);
        }
      }
    });
  }

  private async expireToken(
    event: string,
    token: string
  ): Promise<UpdateResult | DeleteResult | null> {
    const user = await this.userRepository.findByToken(event, token);

    if (user === null) {
      return null;
    }

    if (event === 'signupToken') {
      return await this.userRepository.deleteUser(user.id);
    } else {
      return await this.userRepository.updateUser(
        { id: user.id },
        { [event]: null }
      );
    }
  }
}
