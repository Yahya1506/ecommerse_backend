/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class SessionGuard implements CanActivate {
    constructor(private jwtService: JwtService,private auth:AuthService, private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();

        // 1) extract cookie
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) throw new UnauthorizedException('No access token');



        // verify signature and expiry
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const sessionId = payload.jti;
        


        if (!sessionId) throw new UnauthorizedException('Malformed token');

        const session = await this.prisma.refreshToken.findUnique({
            where:{
                id:sessionId
            }
        });
        console.log(session)
        if (!session) throw new UnauthorizedException('Session not found');

        if (session.invalidatedAt) throw new UnauthorizedException('Session revoked');
        if (session.expiresAt && session.expiresAt.getTime() < Date.now()) {
            throw new UnauthorizedException('Session expired');
        }
        req.user = { jti :sessionId };

        return true;
    }
}
