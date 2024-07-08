import { BadRequestException } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsString, Matches } from 'class-validator';

export class DeleteAccountDto {
  @Transform(({ value }) => {
    if (value.trim() !== 'Delete account') {
      throw new BadRequestException('Wrong input value');
    }
    return value.trim();
  })
  @IsString()
  @Matches(/^[A-Za-z\s]+$/)
  readonly validation: string;
}
