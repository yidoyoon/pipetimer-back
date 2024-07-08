import { createMock } from '@golevelup/ts-jest';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';

import { RefreshTokenGuard } from '@/auth/interface/guard/refresh-token.guard';
import { RefreshTokenStrategy } from '@/auth/interface/strategy/refresh-token.strategy';
import { RedisAuthService } from '@/redis/redis-auth.service';

describe('RefreshTokenGuard', () => {
  let guard: RefreshTokenGuard;
  let redisAuthService: RedisAuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [PassportModule.register({ session: true })],
      providers: [
        RefreshTokenGuard,
        RefreshTokenStrategy,
        { provide: RedisAuthService, useValue: { checkLoggedIn: jest.fn() } },
      ],
    }).compile();

    guard = module.get<RefreshTokenGuard>(RefreshTokenGuard);
    redisAuthService = module.get<RedisAuthService>(RedisAuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true when a cookie contains a refreshToken', async () => {
    const context = createMock<ExecutionContext>();

    redisAuthService.checkLoggedIn = jest.fn().mockResolvedValue(true);
    context.switchToHttp().getRequest.mockReturnValue({
      cookies: {
        refreshToken: 'refreshToken',
      },
    });

    await expect(guard.canActivate(context)).resolves.toBeTruthy();
  });

  it('should return error with wrong refreshToken', async () => {
    const context = createMock<ExecutionContext>();

    redisAuthService.checkLoggedIn = jest.fn().mockResolvedValue(false);
    context.switchToHttp().getRequest.mockReturnValue({
      cookies: {
        refreshToken: 'refreshToken',
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Unauthorized')
    );
  });

  it('should return error without refreshToken', async () => {
    const context = createMock<ExecutionContext>();

    context.switchToHttp().getRequest.mockReturnValue({
      cookies: {},
    });

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('No refreshToken')
    );
  });
});
