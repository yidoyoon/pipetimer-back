import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RefreshTokenGuard extends AuthGuard('refresh-token') {
  async canActivate(ctx: ExecutionContext) {
    return (await super.canActivate(ctx)) as boolean;
  }
}
