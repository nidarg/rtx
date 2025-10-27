import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from './dto/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not set!');
    }

    // Apelăm constructorul părintelui cu opțiuni corecte
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret, // aici e sigur string
    });
  }

  validate(payload: JwtPayload) {
    // Transformăm payload-ul în UserResponseDto
    return {
      id: payload.sub,
      username: payload.username,
      role: payload.role,
    };
    // Acest obiect va fi disponibil ca request.user în controller
  }
}
