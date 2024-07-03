import { Inject, Injectable } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CheckDuplicateEmailQuery } from '@/auth/application/query/impl/check-duplicate-email.query';
import { GetUserByEmailQuery } from '@/auth/application/query/impl/get-user-by-email.query';
import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler
  implements IQueryHandler<GetUserByEmailQuery>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(query: CheckDuplicateEmailQuery): Promise<any> {
    const user = await this.userRepository.findByEmail(query.email);

    if (user !== null) {
      return { success: false, data: user };
    }

    return { success: true, data: query.email };
  }
}
