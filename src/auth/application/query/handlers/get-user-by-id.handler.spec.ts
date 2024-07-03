import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { GetUserByIdHandler } from '@/auth/application/query/handlers/get-user-by-id.handler';
import { GetUserByIdQuery } from '@/auth/application/query/impl/get-user-by-id.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

describe('GetUserByIdHandler', () => {
  let getUserByIdHandler: GetUserByIdHandler;
  let userRepository: IUserRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetUserByIdHandler,
        { provide: 'UserRepository', useValue: { findById: jest.fn() } },
      ],
    }).compile();

    getUserByIdHandler = moduleRef.get<GetUserByIdHandler>(GetUserByIdHandler);
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('should run GetUserByIdHandler', () => {
    it('should return user', async () => {
      const user = CreateRandomObject.RandomUserJwt();

      userRepository.findById = jest.fn().mockResolvedValue(user);

      const query = new GetUserByIdQuery(user.id);
      const result = await getUserByIdHandler.execute(query);

      expect(userRepository.findById).toHaveBeenCalledWith(query.id);
      expect(result).toEqual(user);
    });

    it('should return BadRequestException', async () => {
      const user = CreateRandomObject.RandomUserJwt();

      userRepository.findById = jest.fn().mockResolvedValue(null);

      const query = new GetUserByIdQuery(user.id);

      await expect(getUserByIdHandler.execute(query)).rejects.toThrow(
        new BadRequestException('Cannot find user with user id')
      );
      expect(userRepository.findById).toHaveBeenCalledWith(query.id);
    });
  });
});
