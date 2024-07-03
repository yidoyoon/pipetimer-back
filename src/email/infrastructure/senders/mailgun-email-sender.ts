import { Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import formData = require('form-data');
import Mailgun, { MailgunMessageContent } from 'mailgun.js';

import emailConfig from '@/config/email.config';
import { EmailSender } from '@/email/domain/email-sender.interface';

import { IMailgunClient } from 'mailgun.js/Interfaces';

export class MailgunEmailSender implements EmailSender {
  private mg: IMailgunClient;

  constructor(
    @Inject(emailConfig.KEY)
    private config: ConfigType<typeof emailConfig>,
    private logger: Logger
  ) {
    const mailgun = new Mailgun(formData);
    this.mg = mailgun.client({ username: 'api', key: this.config.auth.mailgunKey })
  }

  async send(options: MailgunMessageContent): Promise<void> {
    try {
      const response = await this.mg.messages.create(this.config.auth.mailgunHost, options);
      this.logger.verbose(`Email sent successfully...\n`, response);
    } catch (err) {
      this.logger.error(`Failed to send email...\n`);
      this.logger.error(err)
    }
  }
}
