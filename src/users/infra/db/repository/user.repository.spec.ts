import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { plainToClassFromExist } from 'class-transformer';
import { DataSource, Repository } from 'typeorm';
import { ulid } from 'ulid';

import { RedisTokenService } from '@/redis/redis-token.service';
import { User, UserJwt, UserWithoutPassword } from '@/users/domain/user.model';
import { EmailAdapter } from '@/users/infra/adapter/email.adapter';
import { UserEntity } from '@/users/infra/db/entity/user.entity';
import { UserRepository } from '@/users/infra/db/repository/user.repository';
import { calculateExpirationTime } from '@/users/infra/db/repository/user.repository.private';

jest.mock('ulid');

describe('UserRepository', () => {
  let repo: Repository<UserEntity>;
  let userRepo: UserRepository;
  let dataSource: DataSource;
  let emailService: EmailAdapter;
  let redisService: RedisTokenService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
        {
          provide: EmailAdapter,
          useValue: {
            sendSignupEmailToken: jest.fn(),
            sendResetPasswordToken: jest.fn(),
            sendChangeEmailToken: jest.fn(),
          },
        },
        {
          provide: RedisTokenService,
          useValue: {
            setPXAT: jest.fn(),
            deleteValue: jest.fn(),
          },
        },
      ],
    }).compile();

    repo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    userRepo = module.get<UserRepository>(UserRepository);
    dataSource = module.get<DataSource>(DataSource);
    emailService = module.get<EmailAdapter>(EmailAdapter);
    redisService = module.get<RedisTokenService>(RedisTokenService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return a user', async () => {
      const expectedUserEntity = new UserEntity({ email: 'email@example.com' });
      const expectedUser = plainToClassFromExist(
        new User(),
        expectedUserEntity
      );

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findByEmail('email@example.com');

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'email@example.com',
      });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findByEmail('email@example.com');

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'email@example.com',
      });
    });
  });

  describe('findById', () => {
    it('should return a user', async () => {
      const expectedUserEntity = new UserEntity({ id: 'example' });
      const expectedUser = plainToClassFromExist(
        new UserJwt(),
        expectedUserEntity
      );

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findById('example');

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'example',
      });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findById('example');

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        id: 'example',
      });
    });
  });

  describe('findByEmailAndPassword', () => {
    it('should return a user', async () => {
      const expectedUserEntity = new UserEntity({
        email: 'email@example.com',
        password: 'password',
      });
      const expectedUser = plainToClassFromExist(
        new UserWithoutPassword(),
        expectedUserEntity
      );

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findByEmailAndPassword(
        'email@example.com',
        'password'
      );

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'email@example.com',
        password: 'password',
      });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findByEmailAndPassword(
        'email@example.com',
        'password'
      );

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        email: 'email@example.com',
        password: 'password',
      });
    });
  });

  describe('findBySignupToken', () => {
    it('should return a userEntity', async () => {
      const expectedUser = new UserEntity({ signupToken: 'token' });

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findBySignupToken('token');

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({ signupToken: 'token' });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findBySignupToken('token');

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({ signupToken: 'token' });
    });
  });

  describe('findByResetPasswordToken', () => {
    it('should return a userEntity', async () => {
      const expectedUser = new UserEntity({ resetPasswordToken: 'token' });

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findByResetPasswordToken('token');

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        resetPasswordToken: 'token',
      });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findByResetPasswordToken('token');

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({
        resetPasswordToken: 'token',
      });
    });
  });

  describe('findByUsername', () => {
    it('should return a user', async () => {
      const expectedUser = new UserEntity({ username: 'testuser' });

      repo.findOneBy = jest.fn().mockResolvedValue(expectedUser);

      const actualUser = await userRepo.findByUsername('testuser');

      expect(actualUser).toEqual(expectedUser);
      expect(repo.findOneBy).toHaveBeenCalledWith({ username: 'testuser' });
    });

    it('should return a null', async () => {
      repo.findOneBy = jest.fn().mockResolvedValue(null);

      const actualUser = await userRepo.findByUsername('testuser');

      expect(actualUser).toEqual(null);
      expect(repo.findOneBy).toHaveBeenCalledWith({ username: 'testuser' });
    });
  });

  describe('registerUser', () => {
    it('should register a user', async () => {
      (ulid as jest.Mock).mockReturnValue('token');
      const requestedUser = new User();
      requestedUser.email = 'test@example.com';
      requestedUser.username = 'test';
      requestedUser.password = 'password';
      const savedUser = new UserEntity({
        ...requestedUser,
        id: ulid(),
        signupToken: 'token',
        createdAt: undefined,
        updatedAt: undefined,
      });
      const expiredAt = calculateExpirationTime();
      const mockSave = jest.fn().mockResolvedValue(savedUser);
      dataSource.transaction = jest.fn().mockImplementation(async (cb) => {
        await cb({ save: mockSave });

        return savedUser;
      });

      const result = await userRepo.registerUser(requestedUser);

      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          email: requestedUser.email,
          username: requestedUser.username,
          signupToken: 'token',
        })
      );
      expect(result.email).toEqual(requestedUser.email);
      expect(result.username).toEqual(requestedUser.username);
      expect(emailService.sendSignupEmailToken).toHaveBeenCalledWith(
        requestedUser.email,
        'token'
      );
      expect(redisService.setPXAT).toHaveBeenCalledWith(
        `signupToken:token`,
        '1',
        expiredAt
      );
      expect(mockSave).toHaveBeenCalledTimes(1);
    });

    it("should return Error when 'sendEmailAndSetToken' fails", async () => {
      (ulid as jest.Mock).mockReturnValue('token');
      const requestedUser = new User();
      requestedUser.email = 'test@example.com';
      requestedUser.username = 'test';
      requestedUser.password = 'password';

      dataSource.transaction = jest.fn().mockRejectedValue(new Error());

      await expect(userRepo.registerUser(requestedUser)).rejects.toThrowError(
        new Error()
      );
    });
  });
});
