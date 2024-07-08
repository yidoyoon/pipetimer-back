import { InternalServerErrorException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as Chance from 'chance';

import { SendChangeEmailTokenHandler } from '@/users/application/command/handlers/send-change-email-token.handler';
import { SendChangeEmailTokenCommand } from '@/users/application/command/impl/send-change-email-token.command';
import { IUserRepository } from '@/users/domain/iuser.repository';

describe('SendChangeEmailTokenHandler', () => {
  let sendChangeEmailTokenHandler: SendChangeEmailTokenHandler;
  let userRepository: IUserRepository;
  const chance = new Chance();

  const randomEmail = {
    oldEmail: chance.email(),
    get newEmail() {
      let newEmail;
      do {
        newEmail = chance.email();
      } while (newEmail === this.oldEmail);
      return newEmail;
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SendChangeEmailTokenHandler,
        {
          provide: 'UserRepository',
          useValue: { sendChangeEmailToken: jest.fn() },
        },
      ],
    }).compile();

    sendChangeEmailTokenHandler = moduleRef.get<SendChangeEmailTokenHandler>(
      SendChangeEmailTokenHandler
    );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should add token and send email', async () => {
    userRepository.sendChangeEmailToken = jest
      .fn()
      .mockResolvedValue({ affected: 1 });

    const command = new SendChangeEmailTokenCommand(
      randomEmail.oldEmail,
      randomEmail.newEmail
    );
    const result = await sendChangeEmailTokenHandler.execute(command);

    expect(userRepository.sendChangeEmailToken).toHaveBeenCalledWith(
      command.oldEmail,
      command.newEmail
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw InternalServerErrorException', async () => {
    userRepository.sendChangeEmailToken = jest
      .fn()
      .mockResolvedValue({ affected: 0 });

    const command = new SendChangeEmailTokenCommand(
      randomEmail.oldEmail,
      randomEmail.newEmail
    );

    await expect(
      sendChangeEmailTokenHandler.execute(command)
    ).rejects.toThrowError(
      new InternalServerErrorException('Cannot send change email token')
    );
    expect(userRepository.sendChangeEmailToken).toHaveBeenCalledWith(
      command.oldEmail,
      command.newEmail
    );
  });
});
