import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'chaveSecreta',
    });
  }
  
  async validate(payload: { sub: string; email: string; name: string }) {
    // O Passport.js anexa este objeto ao request.user
    return { id: payload.sub, email: payload.email, name: payload.name };
  }
}
