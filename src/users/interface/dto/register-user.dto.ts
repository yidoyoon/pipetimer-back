import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import * as filter from 'leo-profanity';

import { MatchPassword } from '@/utils/decorators/match-password.decorator';
import { NotIn } from '@/utils/decorators/not-in.decorator';

export class RegisterUserDto {
  @Transform(({ value, obj }) => {
    if (obj.password.includes(value.trim())) {
      throw new BadRequestException(
        'The email string is included in the password.'
      );
    }
    return value.trim();
  })
  @IsString()
  @IsEmail()
  @MaxLength(320)
  email: string;

  @Transform(({ value }) => {
    filter.add(['admin', 'webmaster']);
    const formatted = value.replace(/[0-9\s]/g, '');

    if (filter.check(formatted)) {
      throw new BadRequestException('Name contains prohibited words');
    }

    return value.trim();
  })
  @NotIn('password', {
    message: 'The name string is included in the password.',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(39)
  @Matches(/^[A-Za-z0-9]+$/)
  username: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/^.{8,32}$/)
  password: string;

  // TODO: Test 추가
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @MatchPassword('password', { message: 'Password does not match.' })
  confirmPassword: string;
}
