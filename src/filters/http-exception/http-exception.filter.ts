/* eslint-disable prettier/prettier */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from 'generated/prisma';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception:HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return response.status(HttpStatus.CONFLICT).json({
            statusCode: 409,
            message: 'Unique constraint failed',
            path: request.url,
            timestamp: new Date().toISOString(),
          });
        case 'P2025':
          return response.status(HttpStatus.NOT_FOUND).json({
            statusCode: 404,
            message: 'Record not found',
            path: request.url,
            timestamp: new Date().toISOString(),
          });
        default:
          return response.status(HttpStatus.BAD_REQUEST).json({
            statusCode: 400,
            message: 'Database error',
            path: request.url,
            timestamp: new Date().toISOString(),
          });
      }
    }
    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message:exception.message
    });
  }
}
