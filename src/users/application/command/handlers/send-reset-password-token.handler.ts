import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SuccessDto } from '@/auth/interface/dto/success.dto';
import { SendResetPasswordTokenCommand } from '@/users/application/command/impl/send-reset-password-token.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
@CommandHandler(SendResetPasswordTokenCommand)
export class SendResetPasswordTokenHandler
  implements ICommandHandler<SendResetPasswordTokenCommand>
{
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(command: SendResetPasswordTokenCommand): Promise<SuccessDto> {
    const result = await this.userRepository.sendResetPasswordToken(
      command.email
    );
    if (result.affected) {
      return { success: true };
    } else {
      throw new InternalServerErrorException(
        'Cannot send reset password email'
      );
    }
  }
}
