import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from 'jsonwebtoken';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '@/auth/application/auth.service';
import { tokenExtractor } from '@/auth/interface/strategy/cookie-extractor';
import { UserJwt } from '@/users/domain/user.model';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        tokenExtractor('accessToken'),
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
      authService: AuthService,
    });
  }

  async validate(payload: JwtPayload & UserJwt) {
    return payload;
  }
}
