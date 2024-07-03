import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { DeleteUserHandler } from '@/users/application/command/handlers/delete-user.handler';
import { DeleteUserCommand } from '@/users/application/command/impl/delete-user.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

describe('DeleteUserHandler', () => {
  let deleteUserHandler: DeleteUserHandler;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteUserHandler,
        {
          provide: 'UserRepository',
          useValue: { deleteUser: jest.fn() },
        },
      ],
    }).compile();

    deleteUserHandler = moduleRef.get<DeleteUserHandler>(DeleteUserHandler);
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete user', async () => {
    userRepository.deleteUser = jest.fn().mockResolvedValue({ affected: 1 });

    const command = new DeleteUserCommand('test');
    const result = await deleteUserHandler.execute(command);

    expect(userRepository.deleteUser).toHaveBeenCalledWith('test');
    expect(result).toEqual({ success: true });
  });

  it('should throw InternalServerErrorException', async () => {
    userRepository.deleteUser = jest.fn().mockResolvedValue({ affected: 0 });

    const command = new DeleteUserCommand('test');

    await expect(deleteUserHandler.execute(command)).rejects.toThrowError(
      new InternalServerErrorException('Cannot delete user')
    );
    expect(userRepository.deleteUser).toHaveBeenCalledWith(command.id);
  });
});
