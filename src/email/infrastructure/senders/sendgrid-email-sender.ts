import { Inject, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import * as sgmail from '@sendgrid/mail';

import emailConfig from '@/config/email.config';
import { EmailSender } from '@/email/domain/email-sender.interface';
import { SendGridEmailOptions } from '@/email/domain/models/email.model';

export class SendGridEmailSender implements EmailSender {
  constructor(
    @Inject(emailConfig.KEY)
    private config: ConfigType<typeof emailConfig>,
    private logger: Logger
  ) {
    sgmail.setApiKey(this.config.auth.sgMailKey);
  }

  async send(options: SendGridEmailOptions): Promise<void> {
    await sgmail.send(options);
    
    this.logger.verbose(
      `Email sent successfully...\nTo: ${options.to}\nSubject: ${options.subject}`
    );
  }
}
