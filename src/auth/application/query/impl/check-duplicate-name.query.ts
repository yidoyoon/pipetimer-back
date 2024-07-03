import { IQuery } from '@nestjs/cqrs';

export class CheckDuplicateNameQuery implements IQuery {
  constructor(readonly username: string) {}
}
