/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TaskSchedularService } from './task-schedular.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [TaskSchedularService,PrismaService]
})
export class TaskSchedularModule {}
