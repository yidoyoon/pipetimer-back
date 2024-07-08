import { Logger, Module } from '@nestjs/common';

import { EmailFactory } from '@/email/application/factories/email.factory';

import { EmailService } from './application/services/email.service';

@Module({
  providers: [EmailService, Logger, EmailFactory],
  exports: [EmailService, EmailFactory],
})
export class EmailModule {}
