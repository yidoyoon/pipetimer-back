import { OmitType } from '@nestjs/mapped-types';

import { AUserJwt } from '@/shared/abstracts/generate-user-jwt.base';

export class User extends AUserJwt {
  id: string;
  email: string;
  username: string;
  password: string;
  newEmail: string;
  signupToken: string;
  changePasswordToken: string;
  changeEmailToken: string;
  todayTotal: number;
}

export class UserSocket {
  id: string;
  loggedIn: boolean;
  timerStartedAt: Date | null;
}

export class UserWithoutPassword extends OmitType(User, ['password']) {}

export class UserJwt extends AUserJwt {
  id: string;
  email: string;
  username: string;
}
