import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

import { MatchPassword } from '@/utils/decorators/match-password.decorator';
export class ChangePasswordDto {
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^.{8,32}$/)
  readonly password: string;

  // TODO: Test 추가
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @MatchPassword('password', { message: 'Password does not match.' })
  readonly confirmPassword: string;
}
