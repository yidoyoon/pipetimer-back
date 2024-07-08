import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';

import { RedisAuthService } from '@/redis/redis-auth.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'refresh-token'
) {
  constructor(private redisAuthService: RedisAuthService) {
    super();
  }

  async validate(req: Request): Promise<any> {
    if (req.cookies.hasOwnProperty('refreshToken') === false) {
      throw new UnauthorizedException('No refreshToken');
    } else {
      return this.redisAuthService.checkLoggedIn(req);
    }
  }
}
