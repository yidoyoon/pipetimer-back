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
import { JwtPayload } from 'jsonwebtoken';

import { JwtAuthGuard } from '@/auth/interface/guard/jwt-auth.guard';
import { GetRoutineCommand } from '@/routines/application/command/impl/get-routine.command';
import { RemoveRoutineCommand } from '@/routines/application/command/impl/remove-routine.command';
import { SaveRoutineCommand } from '@/routines/application/command/impl/save-routine.command';
import { UserJwt } from '@/users/domain/user.model';

@ApiTags('routine')
@Controller('routine')
export class RoutineController {
  constructor(private readonly commandBus: CommandBus) {}
  @UseGuards(JwtAuthGuard)
  @Get('fetch')
  // TODO: 응답 타입 정의
  async fetch(@Req() req) {
    const user = req.user as JwtPayload & UserJwt;

    let routine;

    if ('id' in user) {
      const command = new GetRoutineCommand(user.id);
      routine = await this.commandBus.execute(command);
    }

    return routine;
  }

  @UseGuards(JwtAuthGuard)
  @Post('save')
  async save(@Req() req, @Body() routine) {
    const user = req.user as JwtPayload & UserJwt;

    const command = new SaveRoutineCommand(user.id, routine);

    return await this.commandBus.execute(command);
  }

  @UseGuards(JwtAuthGuard)
  @Post('remove')
  async remove(@Body() id) {
    const command = new RemoveRoutineCommand(Object.keys(id)[0]);

    return await this.commandBus.execute(command);
  }

  @ApiExcludeEndpoint()
  @All('*')
  handleNotFound(): Promise<NotFoundException> {
    throw new NotFoundException('The requested resource could not be found.');
  }
}
