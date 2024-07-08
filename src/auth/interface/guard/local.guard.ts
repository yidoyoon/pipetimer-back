import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalGuard extends AuthGuard('local') {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const result = (await super.canActivate(ctx)) as boolean;

    await super.logIn(ctx.switchToHttp().getRequest());

    return result;
  }
}
