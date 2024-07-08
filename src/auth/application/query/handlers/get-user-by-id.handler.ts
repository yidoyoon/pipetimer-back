import { BadRequestException, Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { GetUserByIdQuery } from '@/auth/application/query/impl/get-user-by-id.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { UserJwt } from '@/users/domain/user.model';

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(query: GetUserByIdQuery): Promise<UserJwt> {
    const user = await this.userRepository.findById(query.id);

    if (user !== null) {
      return user;
    }

    throw new BadRequestException('Cannot find user with user id');
  }
}
