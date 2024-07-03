import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ChangeNameCommand } from '@/users/application/command/impl/change-name.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

import { ChangeNameHandler } from './change-name.handler';

describe('ChangeNameHandler', () => {
  let changeNameHandler: ChangeNameHandler;
  let userRepository: IUserRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeNameHandler,
        { provide: 'UserRepository', useValue: { updateUser: jest.fn() } },
      ],
    }).compile();

    changeNameHandler = moduleRef.get<ChangeNameHandler>(ChangeNameHandler);
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update user name', async () => {
    userRepository.updateUser = jest.fn().mockResolvedValue({ affected: 1 });

    const command = new ChangeNameCommand('test@example.com', 'user1');
    const result = await changeNameHandler.execute(command);

    expect(userRepository.updateUser).toHaveBeenCalledWith(
      { email: command.email },
      { name: command.newName }
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw InternalServerErrorException', async () => {
    userRepository.updateUser = jest.fn().mockResolvedValue({ affected: 0 });

    const command = new ChangeNameCommand('test@example.com', 'user1');

    await expect(changeNameHandler.execute(command)).rejects.toThrow(
      new InternalServerErrorException('Cannot change username')
    );
    expect(userRepository.updateUser).toHaveBeenCalledWith(
      { email: command.email },
      { name: command.newName }
    );
  });
});
