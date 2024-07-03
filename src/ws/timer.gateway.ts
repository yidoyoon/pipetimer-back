import { Inject, UnauthorizedException } from '@nestjs/common';
import { ConfigService, ConfigType } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { parse, serialize } from 'cookie';
import { Server, Socket } from 'socket.io';
import { ulid } from 'ulid';

import accessTokenConfig from '@/config/access-token.config';
import { RedisAuthService } from '@/redis/redis-auth.service';
import { RedisTimerSocketService } from '@/redis/redis-timer-socket.service';

const configService = new ConfigService(); // ConfigService 인스턴스 생성
const corsOptions = configService.get('cors');

@WebSocketGateway({
  cors: {
    origin: [{ ...corsOptions }],
    credentials: true,
  },
})
export class TimerGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    @Inject(accessTokenConfig.KEY)
    private accessConf: ConfigType<typeof accessTokenConfig>,
    private redisAuthService: RedisAuthService,
    private redisTimerSocketService: RedisTimerSocketService
  ) {}

  async handleConnection(client: Socket, ...args: any[]) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client connected: ${client.id}`);
    }

    this.server.engine.on('initial_headers', (headers, request) => {
      const refreshToken =
        parse(request.headers.cookie || '').refreshToken === undefined;
      const guestId = parse(request.headers.cookie || '').guest === undefined;

      if (refreshToken && guestId) {
        headers['set-cookie'] = serialize(
          'guest',
          `s:${ulid()}.`,
          this.accessConf
        );
      }
    });

    if (client.handshake.headers.hasOwnProperty('cookie')) {
      await this.parseAndValidateCookie(client.handshake.headers.cookie);
    }
  }

  async parseAndValidateCookie(cookie: string) {
    const parsedCookie = parse(cookie);
    if (parsedCookie.refreshToken === undefined) {
      const guestToken = await this.redisAuthService.formatToken(
        parsedCookie.guest
      );
      await this.redisTimerSocketService.setLoggedIn(guestToken, 'guest');
    } else {
      const data = await this.getDataWithRefreshToken(
        parsedCookie.refreshToken
      );
      if (data === null) {
        throw new UnauthorizedException('Invalid refreshToken');
      } else {
        await this.redisTimerSocketService.setLoggedIn(
          data.passport.user.id,
          'user'
        );
      }
    }
  }

  async getDataWithRefreshToken(rawToken: string) {
    const refreshToken = await this.redisAuthService.formatToken(rawToken);

    return await this.redisAuthService.getDataWithToken(refreshToken);
  }

  handleDisconnect(client: Socket) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Client disconnected: ${client.id}`);
    }
  }

  @SubscribeMessage('timerStatus')
  async handleStartTimer(
    client: Socket,
    payload: { id: string; role: string; startTimer: boolean }
  ): Promise<void> {
    if (payload.startTimer === true) {
      console.log('timer started');
      await this.redisTimerSocketService.setTimerStatus(
        payload.id,
        payload.role,
        new Date()
      );
    } else {
      const now = new Date();
      const past = await this.redisTimerSocketService.getUserStatus(
        payload.id,
        payload.role
      );
      await this.redisTimerSocketService.setTimerStatus(
        payload.id,
        payload.role,
        null
      );
      console.log(now);
      console.log(past.timerStartedAt);
    }
  }
}
