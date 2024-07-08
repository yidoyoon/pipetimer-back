import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';

import { CheckDuplicateEmailQuery } from '@/auth/application/query/impl/check-duplicate-email.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CheckDuplicateEmailDto } from '@/users/interface/dto/check-duplicate-email.dto';

@Injectable()
@CommandHandler(CheckDuplicateEmailQuery)
export class CheckDuplicateEmailHandler
  implements IQueryHandler<CheckDuplicateEmailQuery>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(
    query: CheckDuplicateEmailQuery
  ): Promise<CheckDuplicateEmailDto> {
    const user = await this.userRepository.findByEmail(query.email);

    if (user === null) return { email: query.email };

    throw new BadRequestException('Duplicate email');
  }
}
