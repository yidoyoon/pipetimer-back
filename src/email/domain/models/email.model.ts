import { OmitType } from '@nestjs/mapped-types';
import { MailgunMessageContent, MimeMessage } from 'mailgun.js';

export abstract class EmailOptions {
  to: string;
  subject: string;
  html: string;
  from: string;
}

export class SendGridEmailOptions extends EmailOptions {}

export class NodemailerEmailOptions extends OmitType(SendGridEmailOptions, [
  'from',
]) {}

export class MailgunEmailOptions extends EmailOptions {
	text: string;
}