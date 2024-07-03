import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CheckDuplicateNameQuery } from '@/auth/application/query/impl/check-duplicate-name.query';
import { IUserRepository } from '@/users/domain/iuser.repository';

@QueryHandler(CheckDuplicateNameQuery)
export class CheckDuplicateNameHandler
  implements IQueryHandler<CheckDuplicateNameQuery>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(query: CheckDuplicateNameQuery): Promise<any> {
    const { username } = query;
    const user = await this.userRepository.findByUsername(username);

    if (user !== null) {
      return { success: true, data: user };
    }

    return { success: false };
  }
}
