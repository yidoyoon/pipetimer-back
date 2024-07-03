import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';

import { REDIS_AUTH } from '@/redis/redis.constants';

type SessionObject = {
  passport: {
    user: {
      id: string;
    };
  };
};

@Injectable()
export class RedisAuthService {
  constructor(@Inject(REDIS_AUTH) private redisClient: Redis) {}

  async checkLoggedIn(req: Request): Promise<{ id: string } | boolean> {
    const rawToken = await this.getTokenFromRequest(req);
    const refreshToken = await this.formatToken(rawToken);
    const sessionObject = await this.getDataWithToken(refreshToken);

    return sessionObject.hasOwnProperty('passport')
      ? sessionObject.passport.user
      : false;
  }

  async getTokenFromRequest(req: Request) {
    if (req.cookies.hasOwnProperty('refreshToken') === true) {
      return req.cookies.refreshToken;
    } else {
      throw new UnauthorizedException('No refreshToken');
    }
  }

  async getDataWithToken(token: string): Promise<SessionObject | null> {
    const sessionString = await this.redisClient.get(`sess:${token}`);

    return sessionString ? JSON.parse(sessionString) : null;
  }

  async formatToken(rawToken: string): Promise<string> {
    return rawToken.split(':')[1].split('.')[0];
  }
}
