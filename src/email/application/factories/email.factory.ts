import { Injectable } from '@nestjs/common';
import { MailDataRequired } from '@sendgrid/helpers/classes/mail';

import {
  NodemailerEmailOptions,
  SendGridEmailOptions,
  MailgunEmailOptions
} from '@/email/domain/models/email.model';

@Injectable()
export class EmailFactory {
  createOption(
    to: string,
    subject: string,
    html: string,
    from?: string,
    text?: string,
  ): MailDataRequired | NodemailerEmailOptions | MailgunEmailOptions {
    if (text != undefined) {
      const emailOptions = new MailgunEmailOptions();
      emailOptions.to = to;
      emailOptions.subject = subject;
      emailOptions.html = html;
      emailOptions.from = from;
      emailOptions.text = text;

      return emailOptions as MailgunEmailOptions;
    }
    else if (from !== undefined) {
      const emailOptions = new SendGridEmailOptions();
      emailOptions.to = to;
      emailOptions.subject = subject;
      emailOptions.html = html;
      emailOptions.from = from;

      return emailOptions as MailDataRequired;
    } else {
      const emailOptions = new NodemailerEmailOptions();
      emailOptions.to = to;
      emailOptions.subject = subject;
      emailOptions.html = html;

      return emailOptions as NodemailerEmailOptions;
    }
  }
}
