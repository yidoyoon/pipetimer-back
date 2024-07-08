import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as argon2 from '@node-rs/argon2';
import { Request } from 'express';
import { createRequest } from 'node-mocks-http';

import { AuthService } from '@/auth/application/auth.service';
import { CheckDuplicateNameQuery } from '@/auth/application/query/impl/check-duplicate-name.query';
import accessTokenConfig from '@/config/access-token.config';
import jwtConfig from '@/config/jwt.config';
import { RedisTokenService } from '@/redis/redis-token.service';
import { ChangeNameCommand } from '@/users/application/command/impl/change-name.command';
import { CheckResetPasswordTokenValidityHandler } from '@/users/application/query/handlers/check-reset-password-token-validity.handler';
import { CheckSignupTokenValidityQuery } from '@/users/application/query/impl/check-signup-token-validity.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { RegisterUserDto } from '@/users/interface/dto/register-user.dto';
import { CreateRandomObject } from '@/utils/test-object-builder.util';

const jwtConf = {
  secret: 'default_secret',
  expiresIn: '365d',
};

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: IUserRepository;
  let jwtService: JwtService;
  let queryBus: QueryBus;
  let commandBus: CommandBus;
  let redisService: RedisTokenService;

  const getRandomString = () => `${Date.now()}`;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        JwtService,
        CheckResetPasswordTokenValidityHandler,
        {
          provide: 'UserRepository',
          useValue: {
            findByEmail: jest.fn(),
            changePassword: jest.fn(),
            registerUser: jest.fn(),
            verifySignupToken: jest.fn(),
          },
        },
        {
          provide: 'RedisTokenService',
          useValue: {
            getPexpiretime: jest.fn(),
            deleteValue: jest.fn(),
            setPXAT: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: jwtConf,
        },
        {
          provide: accessTokenConfig.KEY,
          useValue: accessTokenConfig,
        },
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userRepository = moduleRef.get<IUserRepository>('UserRepository');
    jwtService = moduleRef.get<JwtService>(JwtService);
    queryBus = moduleRef.get<QueryBus>(QueryBus);
    commandBus = moduleRef.get<CommandBus>(CommandBus);
    redisService = moduleRef.get<RedisTokenService>('RedisTokenService');

    jest.spyOn(jwtService, 'sign');
    jest.spyOn(jwtService, 'verify');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('verifyPassword', () => {
    it('success, should verify with argon2 package', async () => {
      const user = CreateRandomObject.RandomUser();

      const password = user.password;
      const hashedPassword = await argon2.hash(password);

      const result = await authService.verifyPassword(hashedPassword, password);

      expect(result).toBe(true);
    });

    it('false, should verify with argon2 package', async () => {
      const user = CreateRandomObject.RandomUser();

      const password = user.password;
      const hashedPassword = await argon2.hash(password);
      let wrongPassword = '';
      do {
        wrongPassword = CreateRandomObject.RandomUser().password;
      } while (password === wrongPassword);

      const result = await authService.verifyPassword(
        hashedPassword,
        wrongPassword
      );

      expect(result).toBe(false);
    });
  });

  describe('login', () => {
    it('success, should return user', async () => {
      const user = CreateRandomObject.RandomUser();
      const loginUserDto = { email: user.email, password: user.password };

      userRepository.findByEmail = jest.fn().mockResolvedValue(user);
      authService.verifyPassword = jest.fn().mockResolvedValue(true);
      const result = await authService.login(loginUserDto);

      expect(userRepository.findByEmail).toHaveBeenCalledWith(
        loginUserDto.email
      );
      expect(authService.verifyPassword).toHaveBeenCalledWith(
        user.password,
        loginUserDto.password
      );
      expect(result).toEqual({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    });

    it('failure case 1, should return BadRequestException', async () => {
      const user = CreateRandomObject.RandomUser();
      const dto = { email: user.email, password: user.password };

      userRepository.findByEmail = jest.fn().mockResolvedValue(null);

      await expect(authService.login(dto)).rejects.toThrow(
        new BadRequestException('No matching account information')
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    });

    it('failure case 2, should return BadRequestException', async () => {
      const user = CreateRandomObject.RandomUser();
      const dto = { email: user.email, password: user.password };

      userRepository.findByEmail = jest.fn().mockResolvedValue(user);
      authService.verifyPassword = jest.fn().mockResolvedValue(false);

      await expect(authService.login(dto)).rejects.toThrow(
        new BadRequestException('Incorrect email or password')
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(authService.verifyPassword).toHaveBeenCalledWith(
        user.password,
        dto.password
      );
    });
  });

  describe('verifyJwt', () => {
    it('should verify JWT and return payload', async () => {
      const payload = CreateRandomObject.RandomUserJwt();
      const jwtString = jwtService.sign({ ...payload }, jwtConf);

      const result = await authService.verifyJwt(jwtString);

      expect(jwtService.verify).toHaveBeenCalledWith(jwtString, jwtConf);
      expect(result).toEqual({
        success: true,
        data: {
          id: payload.id,
          email: payload.email,
          username: payload.username,
        },
      });
    });

    it('should throw JsonWebTokenError', async () => {
      const payload = CreateRandomObject.RandomUserJwt();
      const jwtString = jwtService.sign({ ...payload }, jwtConf);
      let wrongJwtString;
      do {
        wrongJwtString = getRandomString();
      } while (jwtString === wrongJwtString);

      await expect(authService.verifyJwt(wrongJwtString)).rejects.toThrow(
        new BadRequestException('Cannot verify JWT token')
      );
      expect(jwtService.verify).toHaveBeenCalledWith(wrongJwtString, jwtConf);
    });
  });

  describe('verifyResetPasswordToken', () => {
    const event = getRandomString();
    const token = getRandomString();
    const jwt = getRandomString();
    const req = {} as Request;
    req.query = { request: { [event]: token } };

    it('should return jwt', async () => {
      const user = CreateRandomObject.RandomUserJwt();

      authService.splitEventToken = jest
        .fn()
        .mockResolvedValue({ event, token });
      queryBus.execute = jest.fn().mockResolvedValue(user);
      authService.issueJWT = jest.fn().mockResolvedValue(jwt);

      expect(await authService.verifyResetPasswordToken(req)).toBe(jwt);
    });

    it('should throw BadRequestException', async () => {
      authService.splitEventToken = jest
        .fn()
        .mockResolvedValue({ event, token });
      queryBus.execute = jest.fn().mockResolvedValue(null);
      authService.issueJWT = jest.fn().mockResolvedValue(jwt);

      await expect(
        authService.verifyResetPasswordToken(req)
      ).rejects.toThrowError(new BadRequestException(`Invalid ${event} token`));
    });
  });

  describe('changePassword', () => {
    const token = getRandomString();
    const newPassword = getRandomString();
    const result = {
      success: true,
      data: CreateRandomObject.RandomUserJwt(),
    };

    it('should return success', async () => {
      const updateResult = { affected: 1 };

      authService.verifyJwt = jest.fn().mockResolvedValue(result);
      userRepository.changePassword = jest.fn().mockResolvedValue(updateResult);

      expect(await authService.changePassword(token, newPassword)).toEqual({
        success: true,
      });
      expect(authService.verifyJwt).toHaveBeenCalledWith(token);
      expect(userRepository.changePassword).toHaveBeenCalledWith(
        result.data.id,
        token,
        newPassword
      );
    });

    it('verified JWT, but throw InternalServerErrorException', async () => {
      authService.verifyJwt = jest.fn().mockResolvedValue(result);
      userRepository.changePassword = jest.fn().mockRejectedValue(new Error());

      await expect(
        authService.changePassword(token, newPassword)
      ).rejects.toThrowError(
        new InternalServerErrorException('Cannot update password')
      );
      expect(authService.verifyJwt).toHaveBeenCalledWith(token);
      expect(userRepository.changePassword).toHaveBeenCalledWith(
        result.data.id,
        token,
        newPassword
      );
    });
  });

  describe('changeNameAndJWT', () => {
    const id = getRandomString();
    const email = `${getRandomString()}@${getRandomString()}.com`;
    const newName = getRandomString();
    const newAccessToken = getRandomString();

    it('should return success, token', async () => {
      queryBus.execute = jest.fn().mockResolvedValue({ success: false });
      commandBus.execute = jest.fn().mockResolvedValue(undefined);
      authService.issueJWT = jest.fn().mockResolvedValue(newAccessToken);

      const result = await authService.changeNameAndJWT(id, email, newName);

      expect(queryBus.execute).toBeCalledWith(
        new CheckDuplicateNameQuery(newName)
      );
      expect(commandBus.execute).toBeCalledWith(
        new ChangeNameCommand(email, newName)
      );
      expect(authService.issueJWT).toBeCalledWith({
        id,
        email,
        username: newName,
      });
      expect(result).toEqual({ success: true, data: newAccessToken });
    });

    it('should return BadRequestException', async () => {
      queryBus.execute = jest.fn().mockResolvedValue({ success: true });

      await expect(
        authService.changeNameAndJWT(id, email, newName)
      ).rejects.toThrowError(new BadRequestException('Duplicate user name'));

      expect(queryBus.execute).toBeCalledWith(
        new CheckDuplicateNameQuery(newName)
      );
    });
  });

  describe('verifySignupToken', () => {
    const event = getRandomString();
    const token = getRandomString();
    const key = `${event}:${token}`;
    const req = createRequest({
      query: {
        [event]: token,
      },
    });
    const user = CreateRandomObject.RandomUserWithoutPassword();
    const expiredAt = Date.now() + 1000;
    it('all success, should return success', async () => {
      queryBus.execute = jest.fn().mockResolvedValue(user);
      redisService.getPexpiretime = jest.fn().mockResolvedValue(expiredAt);
      userRepository.verifySignupToken = jest
        .fn()
        .mockResolvedValue({ affected: 1 });

      const result = await authService.verifySignupToken(req);

      expect(queryBus.execute).toBeCalledWith(
        new CheckSignupTokenValidityQuery(token)
      );
      expect(redisService.getPexpiretime).toBeCalledWith(key);
      expect(userRepository.verifySignupToken).toBeCalledWith(user.id, token);
      expect(result).toEqual({ success: true });
    });

    it('failure_1, invalid user(null), should return BadRequestException', async () => {
      queryBus.execute = jest.fn().mockResolvedValue(null);

      await expect(authService.verifySignupToken(req)).rejects.toThrowError(
        new BadRequestException('The provided token is invalid.')
      );

      expect(queryBus.execute).toBeCalledWith(
        new CheckSignupTokenValidityQuery(token)
      );
      expect(redisService.deleteValue).toBeCalledWith(key);
    });

    it('failure_2, mysql, should not remove(verify) mysql token, return InternalServerError', async () => {
      authService.splitEventToken = jest
        .fn()
        .mockResolvedValue({ event, token });
      queryBus.execute = jest.fn().mockResolvedValue(user);
      redisService.getPexpiretime = jest.fn().mockResolvedValue(expiredAt);
      userRepository.verifySignupToken = jest
        .fn()
        .mockResolvedValue({ affected: 0 });

      await expect(authService.verifySignupToken(req)).rejects.toThrowError(
        new InternalServerErrorException(`Unable to verify the ${event}`)
      );

      expect(queryBus.execute).toBeCalledWith(
        new CheckSignupTokenValidityQuery(token)
      );
      expect(redisService.getPexpiretime).toBeCalledWith(key);
    });
  });

  describe('registerUser', () => {
    const user: RegisterUserDto = CreateRandomObject.RandomUserForSignup();

    it('should register user, return success', async () => {
      userRepository.registerUser = jest
        .fn()
        .mockResolvedValue({ email: user.email });

      const result = await authService.registerUser(user);

      expect(userRepository.registerUser).toBeCalledWith({
        email: user.email,
        username: user.username,
        password: user.password,
      });
      expect(result).toEqual({ success: true });
    });

    it('failure_1, duplicate account, return BadRequestException', async () => {
      const err = {
        code: 'ER_DUP_ENTRY',
        message: `Duplicate entry ${user.email}`,
      };
      const regex = /Duplicate entry '([^']+)'/;
      const match = err.message.match(regex);
      const duplicateValue = match ? match[1] : null;

      userRepository.registerUser = jest.fn().mockRejectedValue(err);

      await expect(authService.registerUser(user)).rejects.toThrowError(
        new BadRequestException(`${duplicateValue}`)
      );
    });

    it('failure_2, mysql, return InternalServerErrorException', async () => {
      const err = {
        code: 'EXCEPT_ER_DUP_ENTRY',
      };

      userRepository.registerUser = jest.fn().mockRejectedValue(err);

      await expect(authService.registerUser(user)).rejects.toThrowError(
        new InternalServerErrorException('Cannot register user')
      );
    });
  });

  describe('issueJWT', () => {
    it('should return token', async () => {
      const user = CreateRandomObject.RandomUserJwt();
      const token = getRandomString();

      jwtService.sign = jest.fn().mockResolvedValue(token);

      const result = await authService.issueJWT(user);

      expect(result).toBe(token);
    });
  });

  describe('splitEventToken', () => {
    let query = createRequest().query;
    const event = getRandomString();
    const token = getRandomString();
    it('should return { event, token }', async () => {
      query = { [event]: token };

      const result = await authService.splitEventToken(query);

      expect(result).toEqual({ event, token });
    });

    it('failure_1, no query, should return BadRequestException', async () => {
      query = {} as Request['query'];

      await expect(authService.splitEventToken(query)).rejects.toThrowError(
        new BadRequestException('Invalid request')
      );
    });
  });
});
