/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  NotFoundException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductExistsInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const productId = request.params.id;

    const product = await this.prisma.product.findUnique({
      where: { id: Number(productId) }, 
    });

    if (!product) {
      throw new NotFoundException(`Product with id ${productId} not found`);
    }

    return next.handle(); 
  }
}

