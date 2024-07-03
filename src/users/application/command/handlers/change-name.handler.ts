import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SuccessDto } from '@/auth/interface/dto/success.dto';
import { ChangeNameCommand } from '@/users/application/command/impl/change-name.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
@CommandHandler(ChangeNameCommand)
export class ChangeNameHandler implements ICommandHandler<ChangeNameCommand> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(command: ChangeNameCommand): Promise<SuccessDto> {
    const result = await this.userRepository.updateUser(
      { email: command.email },
      { name: command.newName }
    );

    if (result.affected) return { success: true };

    throw new InternalServerErrorException('Cannot change username');
  }
}
