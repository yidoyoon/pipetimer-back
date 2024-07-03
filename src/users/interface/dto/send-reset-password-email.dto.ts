import { IsEmail } from 'class-validator';

export class SendResetPasswordEmailDto {
  @IsEmail()
  email: string;
}
