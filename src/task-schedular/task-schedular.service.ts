/* eslint-disable prettier/prettier */
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskSchedularService {
  private readonly logger = new Logger(TaskSchedularService.name);

  constructor(private prisma: PrismaService, private mailerService: MailerService) {}

  
  @Cron(CronExpression.EVERY_MINUTE,{timeZone:'Asia/Karachi'})
  async deleteExpiredTokens() {
    try {
      const result = await this.prisma.refreshToken.deleteMany({
        where: {
          expiresAt: { lt: new Date() }, 
        },
      });
      if(result.count > 0){
          this.mailerService.sendMail({
          to:'xaid1506@gmail.com',
          subject:'token deletion',
          text:`Deleted ${result.count} expired refresh tokens`
        });
      }
      
      this.logger.log(`Deleted ${result.count} expired refresh tokens`);
    } catch (err) {
      this.logger.error('Error deleting expired refresh tokens', err);
    }
  }
}