import { IsEmail, IsString, MaxLength } from 'class-validator';

export class CheckDuplicateEmailDto {
  @IsString()
  @IsEmail()
  @MaxLength(320)
  readonly email: string;
}
