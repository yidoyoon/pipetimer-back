import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

import { REDIS_TOKEN } from '@/redis/redis.constants';

@Injectable()
export class RedisTokenService {
  constructor(@Inject(REDIS_TOKEN) private redisClient: Redis) {}

  async setPXAT(key: string, value: string, expiredAt?: number): Promise<'OK'> {
    return this.redisClient.set(key, value, 'PXAT', expiredAt);
  }

  async getPexpiretime(key: string): Promise<number> {
    return this.redisClient.pexpiretime(key);
  }

  async getValue(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  async deleteValue(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async renameToken(oldToken: string, newToken: string): Promise<'OK'> {
    return this.redisClient.rename(
      `signupToken:${oldToken}`,
      `signupToken:${newToken}`
    );
  }

  async getClient(): Promise<Redis> {
    return this.redisClient;
  }
}
