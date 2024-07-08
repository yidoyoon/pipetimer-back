import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { renderFile } from 'ejs';
import { join } from 'path';

import emailConfig from '@/config/email.config';
import { EmailFactory } from '@/email/application/factories/email.factory';
import { EmailSender } from '@/email/domain/email-sender.interface';
import { NodeMailerEmailSender } from '@/email/infrastructure/senders/nodemailer-email-sender';
import { SendGridEmailSender } from '@/email/infrastructure/senders/sendgrid-email-sender';
import { MailgunEmailSender } from '@/email/infrastructure/senders/mailgun-email-sender';

@Injectable()
export class EmailService {
  private readonly host: string;
  private readonly templates = {
    signup: 'signup-email-inlined.ejs',
    changeEmail: 'change-email-inlined.ejs',
    resetPassword: 'reset-password-inlined.ejs',
  };
  private emailSender: EmailSender;

  constructor(
    @Inject(emailConfig.KEY)
    private config: ConfigType<typeof emailConfig>,
    private logger: Logger,
    private emailFactory: EmailFactory
  ) {
    this.host = this.determineHost();
    
    if (this.config.auth.mailgunKey) {
      this.emailSender = new MailgunEmailSender(config, logger)
    } else if (this.config.auth.sgMailKey) {
      this.emailSender = new SendGridEmailSender(config, logger);
    } else {
      this.emailSender = new NodeMailerEmailSender(config, logger);
    }
  }

  private determineHost(): string {
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.NODE_ENV === 'local-staging'
    ) {
      return `${this.config.host}:${process.env.FRONT_PORT_0}`;
    }
    return `${this.config.host}`;
  }

  private getTemplatePath(templateName: keyof typeof this.templates): string {
    return join(__dirname, `../../../public/${this.templates[templateName]}`);
  }

  private async renderEmail(url: string, template: string): Promise<string> {
    return new Promise((resolve, reject) => {
      renderFile(
        template,
        { app_name: 'Pipe Timer', verification_url: url },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });
  }

  async sendSignupEmailToken(email: string, token: string): Promise<void> {
    await this.sendEmail(
      email,
      '회원가입 인증',
      'signup',
      token,
      'signupToken'
    );
  }

  async sendChangeEmailToken(email: string, token: string): Promise<void> {
    await this.sendEmail(
      email,
      '이메일 변경',
      'changeEmail',
      token,
      'changeEmailToken'
    );
  }

  async sendResetPasswordToken(email: string, token: string): Promise<void> {
    await this.sendEmail(
      email,
      '비밀번호 재설정',
      'resetPassword',
      token,
      'resetPasswordToken'
    );
  }

  private async sendEmail(
    email: string,
    subject: string,
    templateName: keyof typeof this.templates,
    token: string,
    tokenQueryParam: string
  ): Promise<void> {
    const url = `https://${this.host}/users/verify-${templateName}?${tokenQueryParam}=${token}`;
    const templatePath = this.getTemplatePath(templateName);

    try {
      const rendered = await this.renderEmail(url, templatePath);
      if (this.config.auth.mailgunHost != undefined) {
        const emailOptions = this.emailFactory.createOption(
          email,
          `Pipe Timer - ${subject}`,
          rendered,
          this.config.auth.mailgunKey ? 'no-reply@pipetimer.com' : undefined,
          "Pipe Timer Email"
        );
        
        await this.emailSender.send(emailOptions);
      } else {
        const emailOptions = this.emailFactory.createOption(
          email,
          `Pipe Timer - ${subject}`,
          rendered,
          this.config.auth.sgMailKey ? 'no-reply@pipetimer.com' : undefined
        );
        await this.emailSender.send(emailOptions);
      }
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
    }
  }
}
