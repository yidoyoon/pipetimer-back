import { Test } from '@nestjs/testing';

import { CheckDuplicateNameHandler } from '@/auth/application/query/handlers/check-duplicate-name.handler';
import { CheckDuplicateNameQuery } from '@/auth/application/query/impl/check-duplicate-name.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('CheckDuplicateNameHandler', () => {
  let checkDuplicateNameHandler;
  let userRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CheckDuplicateNameHandler,
        { provide: 'UserRepository', useValue: { findByUsername: jest.fn() } },
      ],
    }).compile();

    checkDuplicateNameHandler = moduleRef.get<CheckDuplicateNameHandler>(
      CheckDuplicateNameHandler
    );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('should execute CheckDuplicateNameHandler', () => {
    it('return true', async () => {
      const user = CreateRandomObject.RandomUserWithoutPassword();

      userRepository.findByUsername = jest.fn().mockResolvedValue(user);

      const query = new CheckDuplicateNameQuery(user.username);
      const result = await checkDuplicateNameHandler.execute(query);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        query.username
      );
      expect(result).toEqual({ success: true, data: user });
    });

    it('return false', async () => {
      const user = CreateRandomObject.RandomUserWithoutPassword();

      userRepository.findByUsername = jest.fn().mockResolvedValue(null);

      const query = new CheckDuplicateNameQuery(user.username);
      const result = await checkDuplicateNameHandler.execute(query);

      expect(userRepository.findByUsername).toHaveBeenCalledWith(
        query.username
      );
      expect(result).toEqual({ success: false });
    });
  });
});
