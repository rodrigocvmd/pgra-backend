import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

type JwtPayload = {
  sub: string;
  email: string;
};

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'chaveSecreta',
    });
  }
  async validate(payload: JwtPayload) {
    return payload;
  }
}
