/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import {  Strategy } from "passport-google-oauth20";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy,'google'){
    constructor(config: ConfigService){
        const clientID = config.get('clientID')
        const clientSecret = config.get('clientSecret')
        const callbackURL = config.get('callbackURL')
        if(!clientID || !clientSecret || !callbackURL){
            throw new Error('oauth info is not set in environment');
        }

        super({
            clientID,
            clientSecret,
            callbackURL,
            scope: ['profile', 'email'],
        });
    }

    async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: any,
  ): Promise<any> {
    const { id, name, emails} = profile;

    const user = {
      provider: 'google',
      googleId: id,
      email: emails[0].value,
      fname: `${name.givenName}`,
      lname:`${name.familyName}`
    };
    console.log(user);
    return user
  }
}