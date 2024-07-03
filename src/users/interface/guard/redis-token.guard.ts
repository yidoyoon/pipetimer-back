import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RedisTokenGuard extends AuthGuard('redis-token') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    return (await super.canActivate(ctx)) as boolean;
  }
}
