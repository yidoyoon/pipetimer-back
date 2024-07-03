import { Module } from '@nestjs/common';

import { RedisModule } from '@/redis/redis.module';
import { RedisAuthService } from '@/redis/redis-auth.service';
import { RedisTimerSocketService } from '@/redis/redis-timer-socket.service';
import { TimerGateway } from '@/ws/timer.gateway';

@Module({
  imports: [RedisModule],
  providers: [TimerGateway, RedisAuthService, RedisTimerSocketService],
})
export class TimerSocketModule {}
