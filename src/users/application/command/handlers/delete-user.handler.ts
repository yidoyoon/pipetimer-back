import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SuccessDto } from '@/auth/interface/dto/success.dto';
import { DeleteUserCommand } from '@/users/application/command/impl/delete-user.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

@Injectable()
@CommandHandler(DeleteUserCommand)
export class DeleteUserHandler implements ICommandHandler<DeleteUserCommand> {
  constructor(
    @Inject('UserRepository') private userRepository: IUserRepository
  ) {}

  async execute(command: DeleteUserCommand): Promise<SuccessDto> {
    const result = await this.userRepository.deleteUser(command.id);
    if (result.affected) {
      return { success: true };
    } else {
      throw new InternalServerErrorException('Cannot delete user');
    }
  }
}
