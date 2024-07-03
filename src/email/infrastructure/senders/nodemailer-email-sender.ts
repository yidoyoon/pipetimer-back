import { Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';

import emailConfig from '@/config/email.config';
import { EmailSender } from '@/email/domain/email-sender.interface';
import { NodemailerEmailOptions } from '@/email/domain/models/email.model';

export class NodeMailerEmailSender implements EmailSender {
  private transporter: Transporter;

  constructor(
    @Inject(emailConfig.KEY)
    private config: ConfigType<typeof emailConfig>,
    private logger: Logger
  ) {
    this.transporter = createTransport({
      service: this.config.auth.testService,
      auth: {
        user: this.config.auth.testUser,
        pass: this.config.auth.testPassword,
      },
    });
  }

  async send(options: NodemailerEmailOptions): Promise<void> {
    await this.transporter.sendMail(options);
    this.logger.verbose(
      `[Nodemailer] Email sent with Nodemailer successfully...\nTo: ${options.to}\nSubject: ${options.subject}`
    );
  }
}
