import { Test } from '@nestjs/testing';

import { GetUserByEmailHandler } from '@/auth/application/query/handlers/get-user-by-email.handler';
import { GetUserByEmailQuery } from '@/auth/application/query/impl/get-user-by-email.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('GetUserByEmailHandler', () => {
  let getUserByEmailHandler: GetUserByEmailHandler;
  let userRepository: IUserRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserByEmailHandler,
        { provide: 'UserRepository', useValue: { findByEmail: jest.fn() } },
      ],
    }).compile();

    getUserByEmailHandler = moduleRef.get<GetUserByEmailHandler>(
      GetUserByEmailHandler
    );
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('it should run GetUserByEmailHandler', () => {
    it('return {success: false, data: user}', async () => {
      const user = CreateRandomObject.RandomUser();

      userRepository.findByEmail = jest.fn().mockResolvedValue(user);

      const query = new GetUserByEmailQuery(user.email);
      const result = await getUserByEmailHandler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(query.email);
      expect(result).toEqual({ success: false, data: user });
    });

    it('return {success: true, data: query.email}', async () => {
      const user = CreateRandomObject.RandomUser();

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      const query = new GetUserByEmailQuery(user.email);
      const result = await getUserByEmailHandler.execute(query);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(query.email);
      expect(result).toEqual({ success: true, data: query.email });
    });
  });
});
