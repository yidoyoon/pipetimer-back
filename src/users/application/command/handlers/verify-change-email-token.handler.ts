import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { VerifyChangeEmailTokenCommand } from '@/users/application/command/impl/verify-change-email-token.command';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { UserJwt } from '@/users/domain/user.model';

@Injectable()
@CommandHandler(VerifyChangeEmailTokenCommand)
export class VerifyChangeEmailTokenHandler
  implements ICommandHandler<VerifyChangeEmailTokenCommand>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}
  async execute(command: VerifyChangeEmailTokenCommand): Promise<UserJwt> {
    const user = await this.userRepository.findByChangeEmailToken(
      command.changeEmailToken
    );

    if (user !== null) {
      const result = await this.userRepository.changeEmail(
        user.id,
        user.newEmail,
        command.changeEmailToken
      );

      if (result.affected !== 0) {
        return {
          id: user.id,
          email: user.newEmail,
          username: user.username,
        };
      }
    }

    throw new InternalServerErrorException('Cannot verify change email token');
  }
}
