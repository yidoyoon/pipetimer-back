import { BadRequestException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { AuthService } from '@/auth/application/auth.service';
import { RedisTokenService } from '@/redis/redis-token.service';

@Injectable()
export class RedisTokenStrategy extends PassportStrategy(
  Strategy,
  'redis-token'
) {
  constructor(
    private authService: AuthService,
    private redisService: RedisTokenService
  ) {
    super();
  }

  async validate(req: Request): Promise<boolean> {
    const { event, token } = await this.authService.splitEventToken(req.query);

    const isValid = await this.redisService.getValue(`${event}:${token}`);
    if (isValid !== null) {
      return true;
    } else {
      throw new BadRequestException(`Invalid ${event}`);
    }
  }
}
