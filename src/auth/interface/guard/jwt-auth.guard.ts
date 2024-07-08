import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    return (await super.canActivate(ctx)) as boolean;
  }
}
