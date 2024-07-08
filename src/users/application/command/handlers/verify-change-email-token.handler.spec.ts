import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { VerifyChangeEmailTokenHandler } from '@/users/application/command/handlers/verify-change-email-token.handler';
import { VerifyChangeEmailTokenCommand } from '@/users/application/command/impl/verify-change-email-token.command';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('VerifyChangeEmailTokenHandler', () => {
  let verifyChangeEmailTokenHandler: VerifyChangeEmailTokenHandler;
  let userRepository: IUserRepository;

  const user = CreateRandomObject.RandomUserWithoutPassword();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VerifyChangeEmailTokenHandler,
        {
          provide: 'UserRepository',
          useValue: {
            findByChangeEmailToken: jest.fn(),
            changeEmail: jest.fn(),
          },
        },
      ],
    }).compile();

    verifyChangeEmailTokenHandler =
      moduleRef.get<VerifyChangeEmailTokenHandler>(
        VerifyChangeEmailTokenHandler
      );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should verify change email token and return success', async () => {
    userRepository.findByChangeEmailToken = jest.fn().mockResolvedValue(user);
    userRepository.changeEmail = jest.fn().mockResolvedValue({ affected: 1 });

    const command = new VerifyChangeEmailTokenCommand(user.changeEmailToken);
    const result = await verifyChangeEmailTokenHandler.execute(command);

    expect(result).toEqual({
      id: user.id,
      email: user.newEmail,
      username: user.username,
    });

    expect(userRepository.findByChangeEmailToken).toHaveBeenCalledWith(
      command.changeEmailToken
    );
    expect(userRepository.changeEmail).toHaveBeenCalledWith(
      user.id,
      user.newEmail,
      command.changeEmailToken
    );
  });

  it('should throw InternalServerErrorException with user(null)', async () => {
    userRepository.findByChangeEmailToken = jest.fn().mockResolvedValue(null);

    const command = new VerifyChangeEmailTokenCommand(user.changeEmailToken);
    await expect(
      verifyChangeEmailTokenHandler.execute(command)
    ).rejects.toThrow(
      new InternalServerErrorException('Cannot verify change email token')
    );

    expect(userRepository.findByChangeEmailToken).toHaveBeenCalledWith(
      command.changeEmailToken
    );
  });

  it('should throw InternalServerErrorException with repository error', async () => {
    userRepository.findByChangeEmailToken = jest.fn().mockResolvedValue(user);
    userRepository.changeEmail = jest.fn().mockResolvedValue({ affected: 0 });

    const command = new VerifyChangeEmailTokenCommand(user.changeEmailToken);
    await expect(
      verifyChangeEmailTokenHandler.execute(command)
    ).rejects.toThrow(
      new InternalServerErrorException('Cannot verify change email token')
    );

    expect(userRepository.findByChangeEmailToken).toHaveBeenCalledWith(
      command.changeEmailToken
    );
  });
});
