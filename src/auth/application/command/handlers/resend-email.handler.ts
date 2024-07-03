import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CommandHandler, IQueryHandler } from '@nestjs/cqrs';

import { ResendEmailCommand } from '@/auth/application/command/impl/resend-email.command';
import { SuccessDto } from '@/auth/interface/dto/success.dto';
import { IRedisTokenAdapter } from '@/users/application/adapter/iredis-token.adapter';
import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
@CommandHandler(ResendEmailCommand)
export class ResendEmailHandler implements IQueryHandler<ResendEmailCommand> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(command: ResendEmailCommand): Promise<SuccessDto> {
    const user = await this.userRepository.findByEmail(command.email);
    if (!user) {
      throw new BadRequestException('Cannot find user with email');
    }

    const result = await this.userRepository.renewSignupToken(
      command.email,
      user.signupToken
    );
    if (result.affected > 0) {
      return { success: true };
    }

    throw new InternalServerErrorException('Cannot renew signup token');
  }
}
