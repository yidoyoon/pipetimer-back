import { IsEmail } from 'class-validator';

export class SendChangeEmailTokenDto {
  @IsEmail()
  email: string;
}
