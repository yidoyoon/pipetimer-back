import { IQuery } from '@nestjs/cqrs';

export class CheckSignupTokenValidityQuery implements IQuery {
  constructor(readonly token: string) {}
}
