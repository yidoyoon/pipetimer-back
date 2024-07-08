import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_TIMER_SOCKET } from '@/redis/redis.constants';
import { UserSocket } from '@/users/domain/user.model';

@Injectable()
export class RedisTimerSocketService {
  constructor(@Inject(REDIS_TIMER_SOCKET) private redisClient: Redis) {}

  async getUserStatus(id: string, role: string): Promise<any> {
    try {
      return await this.redisClient.hgetall(`${role}:${id}`);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async setLoggedIn(id: string, role: string) {
    const status = new UserSocket();
    status.id = id;
    status.loggedIn = true;
    status.timerStartedAt = null;

    this.redisClient.hset(`${role}:${id}`, status);
  }

  async setTimerStatus(id: string, role: string, time: Date) {
    const userStatus = await this.getUserStatus(id, role);

    const status = new UserSocket();
    status.id = userStatus.id;
    status.loggedIn = userStatus.loggedIn;
    status.timerStartedAt = time;

    this.redisClient.hset(`${role}:${status.id}`, status);
  }
}
