import { HttpException, Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { PassportSerializer } from '@nestjs/passport';

import { GetUserByIdQuery } from '@/auth/application/query/impl/get-user-by-id.query';
import { UserJwt } from '@/users/domain/user.model';

@Injectable()
export class AuthSerializer extends PassportSerializer {
  constructor(private queryBus: QueryBus) {
    super();
  }
  serializeUser(
    user: UserJwt,
    done: (
      err: Error,
      user: { id: string; email: string; username: string }
    ) => void
  ) {
    done(null, {
      id: user.id,
      email: user.email,
      username: user.username,
    });
  }

  async deserializeUser(
    payload: { id: string; email: string; username: string },
    done: (err: Error, user: Omit<UserJwt, 'password'>) => void
  ) {
    const query = new GetUserByIdQuery(payload.id);
    const user = await this.queryBus.execute(query);

    if (user === null) {
      done(new HttpException('User not found', 404), null);
    }
    done(null, user);
  }
}
