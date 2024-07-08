import {
  All,
  Body,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { JwtAuthGuard } from '@/auth/interface/guard/jwt-auth.guard';
import { GetTimerCommand } from '@/timers/application/command/impl/get-timer.command';
import { SaveTimerCommand } from '@/timers/application/command/impl/save-timer.command';
import { Timer } from '@/timers/domain/timer.model';
import { UserJwt } from '@/users/domain/user.model';

@ApiTags('timer')
@Controller('timer')
export class TimerController {
  constructor(private readonly commandBus: CommandBus) {}

  @UseGuards(JwtAuthGuard)
  @Get('fetch')
  async fetch(@Req() req: Request): Promise<Timer[]> {
    const user = req.user as JwtPayload & UserJwt;
    const command = new GetTimerCommand(user.id);

    return await this.commandBus.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async commit(@Req() req: Request, @Body() timer: Timer[]): Promise<any> {
    const user = req.user as JwtPayload & UserJwt;
    const command = new SaveTimerCommand(user.id, timer);

    return await this.commandBus.execute(command);
  }

  @ApiExcludeEndpoint()
  @All('*')
  handleNotFound(): Promise<NotFoundException> {
    throw new NotFoundException('The requested resource could not be found.');
  }
}
