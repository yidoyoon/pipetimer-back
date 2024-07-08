import { BadRequestException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { CheckResetPasswordTokenValidityQuery } from '@/users/application/query/impl/check-reset-password-token-validity.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { UserWithoutPassword } from '@/users/domain/user.model';

@QueryHandler(CheckResetPasswordTokenValidityQuery)
export class CheckResetPasswordTokenValidityHandler
  implements IQueryHandler<CheckResetPasswordTokenValidityQuery>
{
  constructor(
    @Inject('UserRepository')
    private userRepository: IUserRepository
  ) {}

  async execute(
    query: CheckResetPasswordTokenValidityQuery
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userRepository.findByResetPasswordToken(
      query.token
    );

    if (user) return user;

    throw new BadRequestException('Invalid reset password token');
  }
}
