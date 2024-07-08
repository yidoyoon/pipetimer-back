import { UserJwt } from '@/users/domain/user.model';

declare global {
  namespace Express {
    export interface User extends UserJwt {
      super();
    }
  }
}
