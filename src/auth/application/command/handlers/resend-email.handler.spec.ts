import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { ResendEmailHandler } from '@/auth/application/command/handlers/resend-email.handler';
import { ResendEmailCommand } from '@/auth/application/command/impl/resend-email.command';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('ResendEmailHandler', () => {
  let resendEmailHandler;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ResendEmailHandler,
        {
          provide: 'UserRepository',
          useValue: { findByEmail: jest.fn(), renewSignupToken: jest.fn() },
        },
      ],
    }).compile();

    resendEmailHandler = moduleRef.get<ResendEmailHandler>(ResendEmailHandler);
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resend email', async () => {
    const user = CreateRandomObject.RandomUser();

    userRepository.findByEmail = jest.fn().mockResolvedValue(user);
    userRepository.renewSignupToken = jest
      .fn()
      .mockResolvedValue({ affected: 1 });

    const command = new ResendEmailCommand(user.email);
    const result = await resendEmailHandler.execute(command);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.renewSignupToken).toHaveBeenCalledWith(
      command.email,
      user.signupToken
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw BadRequestException', async () => {
    const user = CreateRandomObject.RandomUser();

    userRepository.findByEmail = jest.fn().mockResolvedValue(null);

    const command = new ResendEmailCommand(user.email);

    await expect(resendEmailHandler.execute(command)).rejects.toThrowError(
      new BadRequestException('Cannot find user with email')
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.renewSignupToken).not.toHaveBeenCalled();
  });

  it('should throw InternalServerError', async () => {
    const user = CreateRandomObject.RandomUser();

    userRepository.findByEmail = jest.fn().mockResolvedValue(user);
    userRepository.renewSignupToken = jest
      .fn()
      .mockResolvedValue({ affected: 0 });

    const command = new ResendEmailCommand(user.email);

    await expect(resendEmailHandler.execute(command)).rejects.toThrowError(
      new InternalServerErrorException('Cannot renew signup token')
    );
    expect(userRepository.findByEmail).toHaveBeenCalledWith(command.email);
    expect(userRepository.renewSignupToken).toHaveBeenCalledWith(
      command.email,
      user.signupToken
    );
  });
});
