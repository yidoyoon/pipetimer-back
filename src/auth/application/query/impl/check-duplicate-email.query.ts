import { IQuery } from '@nestjs/cqrs';

export class CheckDuplicateEmailQuery implements IQuery {
  constructor(readonly email: string) {}
}
