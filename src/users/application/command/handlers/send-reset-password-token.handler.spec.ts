import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as Chance from 'chance';

import { SendResetPasswordTokenHandler } from '@/users/application/command/handlers/send-reset-password-token.handler';
import { SendResetPasswordTokenCommand } from '@/users/application/command/impl/send-reset-password-token.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

const chance = new Chance();

describe('SendResetPasswordEmailHandler', () => {
  let sendResetPasswordEmailHandler: SendResetPasswordTokenHandler;
  let userRepository: IUserRepository;

  const randomEmail = chance.email();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SendResetPasswordTokenHandler,
        {
          provide: 'UserRepository',
          useValue: {
            sendResetPasswordToken: jest.fn(),
          },
        },
      ],
    }).compile();

    sendResetPasswordEmailHandler =
      moduleRef.get<SendResetPasswordTokenHandler>(
        SendResetPasswordTokenHandler
      );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send reset password token', async () => {
    userRepository.sendResetPasswordToken = jest
      .fn()
      .mockResolvedValue({ affected: 1 });

    const command = new SendResetPasswordTokenCommand(randomEmail);
    const result = await sendResetPasswordEmailHandler.execute(command);

    expect(userRepository.sendResetPasswordToken).toHaveBeenCalledWith(
      randomEmail
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw InternalServerErrorException ', async () => {
    userRepository.sendResetPasswordToken = jest
      .fn()
      .mockResolvedValue({ affected: 0 });

    const command = new SendResetPasswordTokenCommand(randomEmail);

    await expect(
      sendResetPasswordEmailHandler.execute(command)
    ).rejects.toThrowError(
      new InternalServerErrorException('Cannot send reset password email')
    );
    expect(userRepository.sendResetPasswordToken).toHaveBeenCalledWith(
      command.email
    );
  });
});
