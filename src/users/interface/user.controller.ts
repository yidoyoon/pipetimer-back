import {
  All,
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import {
  ApiBody,
  ApiExcludeEndpoint,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';

import { AuthService } from '@/auth/application/auth.service';
import { SuccessDto } from '@/auth/interface/dto/success.dto';
import { JwtAuthGuard } from '@/auth/interface/guard/jwt-auth.guard';
import accessTokenConfig from '@/config/access-token.config';
import { Session } from '@/shared/types/common-types';
import { DeleteUserCommand } from '@/users/application/command/impl/delete-user.command';
import { SendChangeEmailTokenCommand } from '@/users/application/command/impl/send-change-email-token.command';
import { SendResetPasswordTokenCommand } from '@/users/application/command/impl/send-reset-password-token.command';
import { VerifyChangeEmailTokenCommand } from '@/users/application/command/impl/verify-change-email-token.command';
import { UserJwt } from '@/users/domain/user.model';
import { ChangePasswordDto } from '@/users/interface/dto/change-password.dto';
import { ChangeUsernameDto } from '@/users/interface/dto/change-username.dto';
import { DeleteAccountDto } from '@/users/interface/dto/delete-account.dto';
import { SendChangeEmailTokenDto } from '@/users/interface/dto/send-change-email-token.dto';
import { SendResetPasswordEmailDto } from '@/users/interface/dto/send-reset-password-email.dto';
import { RedisTokenGuard } from '@/users/interface/guard/redis-token.guard';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    @Inject(accessTokenConfig.KEY)
    private accessConf: ConfigType<typeof accessTokenConfig>,
    private authService: AuthService,
    private commandBus: CommandBus
  ) {}

  @UseGuards(RedisTokenGuard)
  @Get('verify-signup-token')
  @ApiOperation({ summary: 'Verify signup token' })
  @ApiResponse({ type: SuccessDto })
  async verifySignupToken(@Req() req: Request): Promise<SuccessDto> {
    return await this.authService.verifySignupToken(req);
  }

  @Post('send-reset-password-email')
  @ApiBody({ type: SendResetPasswordEmailDto })
  @ApiOperation({ summary: 'Send reset password email' })
  @ApiResponse({ type: SuccessDto })
  async sendResetPasswordEmail(
    @Body() dto: SendResetPasswordEmailDto
  ): Promise<SuccessDto> {
    const command = new SendResetPasswordTokenCommand(dto.email);

    return await this.commandBus.execute(command);
  }

  @UseGuards(RedisTokenGuard)
  @Get('verify-reset-password-token')
  @ApiOperation({ summary: 'Verify reset password token' })
  @ApiResponse({
    description: 'Reset password token verified successfully',
  })
  async verifyResetPasswordToken(
    @Req() req,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const token = await this.authService.verifyResetPasswordToken(req);

    if (token !== null) {
      res.cookie('resetPasswordToken', token, this.accessConf);
    }
  }

  @Post('change-password')
  @ApiBody({ type: ChangePasswordDto })
  @ApiOperation({ summary: 'Change user password' })
  @ApiResponse({
    description: 'User password changed successfully',
  })
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.authService.changePassword(
      req.cookies.resetPasswordToken,
      body.password
    );

    res.cookie('resetPasswordToken', null, {
      ...this.accessConf,
      maxAge: 1,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('send-change-email-token')
  @ApiBody({ type: SendChangeEmailTokenDto })
  @ApiOperation({ summary: 'Send email to change email address' })
  @ApiResponse({
    description: 'Email to change email address sent successfully',
  })
  async sendChangeEmailToken(
    @Req() req: Request,
    @Body() body: SendChangeEmailTokenDto
  ): Promise<SuccessDto> {
    const command = new SendChangeEmailTokenCommand(req.user.email, body.email);

    return await this.commandBus.execute(command);
  }

  @UseGuards(RedisTokenGuard)
  @Get('verify-change-email-token')
  @ApiQuery({ name: 'changeEmailToken', type: 'string' })
  @ApiOperation({
    summary: 'Verify change email token to change email address',
  })
  @ApiResponse({
    description: 'Change email token verified successfully',
  })
  async verifyChangeEmailToken(
    @Req() req: Request,
    @Query('changeEmailToken') token: string,
    @Res({ passthrough: true }) res
  ): Promise<UserJwt> {
    const command = new VerifyChangeEmailTokenCommand(token);
    const result = await this.commandBus.execute(command);

    const accessToken = await this.authService.issueJWT(result);
    res.cookie('accessToken', accessToken, this.accessConf);

    return result.data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-name')
  @ApiBody({ type: ChangeUsernameDto })
  @ApiOperation({
    summary: 'Change username and renew access token with new username',
  })
  @ApiResponse({
    description: 'Username changed successfully',
  })
  async changeName(
    @Req() req: Request,
    @Body() body: ChangeUsernameDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<any> {
    const result = await this.authService.changeNameAndJWT(
      req.user.id,
      req.user.email,
      body.newName
    );

    res.cookie('accessToken', result.data, this.accessConf);

    return { success: result.success };
  }

  @UseGuards(JwtAuthGuard)
  @Post('delete-account')
  @ApiBody({ type: DeleteAccountDto })
  @ApiOperation({
    summary: 'Delete account and clear client-side user related cookies',
  })
  @ApiResponse({
    description: 'Account deleted successfully',
  })
  async deleteAccount(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<Session> {
    const command = new DeleteUserCommand(req.user.id);
    await this.commandBus.execute(command);

    req.logout((err) => {
      if (err) return err;
    });
    res.clearCookie('accessToken', { ...this.accessConf, maxAge: 0 });
    req.session.cookie.maxAge = 0;

    return req.session;
  }

  @ApiExcludeEndpoint()
  @All('*')
  handleNotFound(): Promise<NotFoundException> {
    throw new NotFoundException('The requested resource could not be found.');
  }
}
