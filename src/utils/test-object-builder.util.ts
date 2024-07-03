import * as Chance from 'chance';
import { ulid } from 'ulid';

import { User, UserJwt, UserWithoutPassword } from '@/users/domain/user.model';
import { LoginUserDto } from '@/users/interface/dto/login-user.dto';
import { RegisterUserDto } from '@/users/interface/dto/register-user.dto';

export class CreateRandomObject {
  private static chance = new Chance();

  static RandomUserForLogin(): LoginUserDto {
    const user = new User();
    user.email = `${ulid().toLowerCase()}@example.com`;
    user.password = `${this.chance.string({ length: 20 })}`;

    return user;
  }

  static RandomUserWithoutPassword(): UserWithoutPassword {
    const user = new UserWithoutPassword();
    user.id = ulid();
    user.email = `${ulid().toLowerCase()}@example.com`;
    user.username = this.chance.string({
      alpha: true,
      numeric: true,
      symbols: false,
    });
    user.newEmail = '';
    user.changeEmailToken = ulid();
    user.signupToken = null;

    do {
      user.newEmail = this.chance.email();
    } while (user.newEmail === user.email);

    return user;
  }

  static RandomUser(): User {
    const user = new User();
    user.id = ulid();
    user.email = `${ulid().toLowerCase()}@example.com`;
    user.username = this.chance.string({
      alpha: true,
      numeric: true,
      symbols: false,
    });
    user.password = '';
    user.newEmail = '';
    user.changeEmailToken = ulid();
    user.signupToken = null;

    do {
      user.password = this.chance.string({ length: 20 });
    } while (user.username.includes(user.password));

    do {
      user.newEmail = this.chance.email();
    } while (user.newEmail === user.email);

    return user;
  }

  static RandomUserJwt(): UserJwt {
    const user = new UserJwt();
    user.id = ulid();
    user.email = `${ulid().toLowerCase()}@example.com`;
    user.username = this.chance.string({
      alpha: true,
      numeric: true,
      symbols: false,
    });

    return user;
  }

  static RandomUserForSignup(): RegisterUserDto {
    const user = new RegisterUserDto();
    user.email = `${ulid().toLowerCase()}@example.com`;
    user.username = this.chance.string({
      alpha: true,
      numeric: true,
      symbols: false,
    });
    user.password = '';
    do {
      user.password = this.chance.string({ length: 20 });
    } while (user.username.includes(user.password));

    user.confirmPassword = user.password;

    return user;
  }

  static RandomEmail(): string {
    return `${ulid().toLowerCase()}@example.com`;
  }
}
