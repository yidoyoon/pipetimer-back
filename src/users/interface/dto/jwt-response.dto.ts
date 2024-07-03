import { ASuccessDto } from '@/shared/abstracts/common-response.base';
import { UserJwt } from '@/users/domain/user.model';

export class JwtResponseDto extends ASuccessDto {
  success: boolean;
  data?: UserJwt;
}
