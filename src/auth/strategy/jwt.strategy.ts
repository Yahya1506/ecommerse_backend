/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */

import { ExtractJwt, Strategy } from 'passport-jwt';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(config: ConfigService) {
        const secret = config.get<string>('JWT_SECRET')
        if (!secret) {
            console.log(secret);
            throw new Error('JWT_SECRET is not set in environment');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });

    }

    async validate(payload: { id: number, email: string,jti:string}) {
        return { id: payload.id, email: payload.email ,jti:payload.jti};
    }
}