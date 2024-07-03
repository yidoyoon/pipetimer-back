import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from '@node-rs/argon2';
import { Request } from 'express';

import { CheckDuplicateNameQuery } from '@/auth/application/query/impl/check-duplicate-name.query';
import { SuccessDto } from '@/auth/interface/dto/success.dto';
import jwtConfig from '@/config/jwt.config';
import { IRedisTokenAdapter } from '@/users/application/adapter/iredis-token.adapter';
import { ChangeNameCommand } from '@/users/application/command/impl/change-name.command';
import { CheckResetPasswordTokenValidityQuery } from '@/users/application/query/impl/check-reset-password-token-validity.query';
import { CheckSignupTokenValidityQuery } from '@/users/application/query/impl/check-signup-token-validity.query';
import { IUserRepository } from '@/users/domain/iuser.repository';
import { User, UserJwt } from '@/users/domain/user.model';
import { JwtResponseDto } from '@/users/interface/dto/jwt-response.dto';
import { LoginUserDto } from '@/users/interface/dto/login-user.dto';
import { RegisterUserDto } from '@/users/interface/dto/register-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('RedisTokenService') private redisService: IRedisTokenAdapter,
    @Inject('UserRepository') private userRepository: IUserRepository,
    @Inject(jwtConfig.KEY) private jwtConf: ConfigType<typeof jwtConfig>,
    private commandBus: CommandBus,
    private jwtService: JwtService,
    private queryBus: QueryBus
  ) {}

  async verifyPassword(
    hashedPassword: string,
    password: string
  ): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
  }

  async login(dto: LoginUserDto): Promise<UserJwt> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (user === null) {
      throw new BadRequestException('No matching account information');
    }

    const isValid = await this.verifyPassword(user.password, dto.password);
    if (isValid === true) {
      return {
        id: user.id,
        email: user.email,
        username: user.username,
      };
    }

    throw new BadRequestException('Incorrect email or password');
  }

  async verifyJwt(jwtString: string): Promise<JwtResponseDto> {
    try {
      const payload = this.jwtService.verify(jwtString, this.jwtConf);

      return {
        success: true,
        data: {
          id: payload.id,
          email: payload.email,
          username: payload.username,
        },
      };
    } catch (err) {
      throw new BadRequestException('Cannot verify JWT token');
    }
  }

  async verifyResetPasswordToken(req: Request): Promise<string> {
    const { event, token } = await this.splitEventToken(req.query);

    const query = new CheckResetPasswordTokenValidityQuery(token);
    const user = await this.queryBus.execute(query);

    if (user !== null) {
      const jwt = await this.issueJWT({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      return jwt;
    }

    throw new BadRequestException(`Invalid ${event} token`);
  }

  async changePassword(
    token: string,
    newPassword: string
  ): Promise<SuccessDto> {
    const result = await this.verifyJwt(token);
    if (result.success) {
      try {
        const updateResult = await this.userRepository.changePassword(
          result.data.id,
          token,
          newPassword
        );

        if (updateResult.affected) {
          return { success: true };
        }
      } catch (err) {
        throw new InternalServerErrorException('Cannot update password');
      }
    }
  }

  async changeNameAndJWT(
    id: string,
    email: string,
    newName: string
  ): Promise<any> {
    const query = new CheckDuplicateNameQuery(newName);
    const result = await this.queryBus.execute(query);

    if (!result.success) {
      const command = new ChangeNameCommand(email, newName);
      await this.commandBus.execute(command);

      const newAccessToken = await this.issueJWT({
        id,
        email,
        username: newName,
      });

      return {
        success: true,
        data: newAccessToken,
      };
    }

    throw new BadRequestException('Duplicate user name');
  }

  async verifySignupToken(req: Request): Promise<SuccessDto> {
    const { event, token } = await this.splitEventToken(req.query);
    const key = `${event}:${token}`;

    const user = await this.queryBus.execute(
      new CheckSignupTokenValidityQuery(token)
    );

    if (!user) {
      await this.redisService.deleteValue(key);
      throw new BadRequestException('The provided token is invalid.');
    }

    const [expiredAt, result] = await Promise.all([
      this.redisService.getPexpiretime(key),
      this.userRepository.verifySignupToken(user.id, token),
    ]);

    if (result.affected) {
      return { success: true };
    } else {
      await this.redisService.setPXAT(key, '1', expiredAt);
      throw new InternalServerErrorException(`Unable to verify the ${event}`);
    }
  }

  // async checkTokenValidity(token: string, key: string) {
  //   const user = await this.queryBus.execute(
  //     new CheckSignupTokenValidityQuery(token)
  //   );
  //
  //   if (!user) {
  //     await this.redisService.deleteValue(key);
  //     throw new BadRequestException('The provided token is invalid.');
  //   }
  //
  //   return user;
  // }

  async registerUser(user: RegisterUserDto): Promise<SuccessDto> {
    const newUser = new User();
    newUser.email = user.email;
    newUser.username = user.username;
    newUser.password = user.password;

    try {
      const result = await this.userRepository.registerUser(newUser);
      if (result.email) {
        return { success: true };
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        const regex = /Duplicate entry '([^']+)'/;
        const match = err.message.match(regex);
        const duplicateValue = match ? match[1] : null;

        throw new BadRequestException(`${duplicateValue}`);
      } else {
        throw new InternalServerErrorException('Cannot register user');
      }
    }
  }

  async issueJWT(user: UserJwt): Promise<string> {
    return this.jwtService.sign(user, this.jwtConf);
  }

  async splitEventToken(query: Request['query']) {
    if (Object.keys(query).length === 0) {
      throw new BadRequestException('Invalid request');
    }

    const event = Object.keys(query)[0] as string;
    const token = Object.values(query)[0] as string;

    return { event, token };
  }
}
