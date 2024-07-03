import { ASuccessDto } from '@/shared/abstracts/common-response.base';
import { UserWithoutPassword } from '@/users/domain/user.model';

export class UserResponseDto extends ASuccessDto {
  success: boolean;
  data?: UserWithoutPassword;
}
