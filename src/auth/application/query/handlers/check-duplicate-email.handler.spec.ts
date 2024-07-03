import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { CheckDuplicateEmailHandler } from '@/auth/application/query/handlers/check-duplicate-email.handler';
import { CheckDuplicateEmailQuery } from '@/auth/application/query/impl/check-duplicate-email.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('CheckDuplicateEmailHandler', () => {
  let checkDuplicateEmailHandler;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckDuplicateEmailHandler,
        { provide: 'UserRepository', useValue: { findByEmail: jest.fn() } },
      ],
    }).compile();

    checkDuplicateEmailHandler = moduleRef.get<CheckDuplicateEmailHandler>(
      CheckDuplicateEmailHandler
    );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should execute CheckDuplicateEmailQuery', async () => {
    const user = CreateRandomObject.RandomUserWithoutPassword();

    userRepository.findByEmail = jest.fn().mockResolvedValue(null);

    const query = new CheckDuplicateEmailQuery(user.email);
    const result = await checkDuplicateEmailHandler.execute(query);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(query.email);
    expect(result).toEqual({ email: query.email });
  });

  it('should execute BadRequestException', async () => {
    const user = CreateRandomObject.RandomUser();

    userRepository.findByEmail = jest.fn().mockResolvedValue(user);

    const query = new CheckDuplicateEmailQuery(user.email);

    await expect(
      checkDuplicateEmailHandler.execute(query)
    ).rejects.toThrowError(new BadRequestException('Duplicate email'));
    expect(userRepository.findByEmail).toHaveBeenCalledWith(query.email);
  });
});
