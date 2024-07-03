import { IQuery } from '@nestjs/cqrs';

export class CheckResetPasswordTokenValidityQuery implements IQuery {
  constructor(readonly token: string) {}
}
