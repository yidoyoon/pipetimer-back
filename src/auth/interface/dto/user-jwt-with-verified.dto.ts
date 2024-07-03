import { UserJwt } from '@/users/domain/user.model';

export class UserJwtWithVerifiedDto extends UserJwt {
  isVerified: boolean;
}
