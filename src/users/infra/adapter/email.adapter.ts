import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { EmailService } from '@/email/application/services/email.service';
import { IEmailAdapter } from '@/users/application/adapter/iemail.adapter';

@Injectable()
export class EmailAdapter implements IEmailAdapter {
  constructor(@Inject(EmailService) private emailService: EmailService) {}

  async sendSignupEmailToken(email: string, token: string): Promise<void> {
    try {
      await this.emailService.sendSignupEmailToken(email, token);
    } catch (err) {
      throw new InternalServerErrorException('Cannot send signup email');
    }
  }

  async sendResetPasswordToken(email: string, token: string): Promise<void> {
    try {
      await this.emailService.sendResetPasswordToken(email, token);
    } catch (err) {
      throw new InternalServerErrorException(
        'Cannot send reset password email'
      );
    }
  }

  async sendChangeEmailToken(email: string, token: string): Promise<void> {
    try {
      await this.emailService.sendChangeEmailToken(email, token);
    } catch (err) {
      throw new InternalServerErrorException(
        'Cannot send change email request'
      );
    }
  }
}
