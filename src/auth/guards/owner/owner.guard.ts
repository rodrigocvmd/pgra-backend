import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthRequest } from '../../types';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const user = request.user;

    if (!user) {
      return false;
    }

    if (user.role === 'ADMIN') {
      return true;
    }

    const { id } = request.params;
    const entity = this.reflector.get<string>('entity', context.getHandler());

    if (!entity) {
      // Se a entidade não for especificada, nega o acesso por segurança.
      throw new ForbiddenException('Entity não especificada para OwnerGuard');
    }

    const record = await (this.prisma as any)[entity].findUnique({
      where: { id },
    });

    if (!record) {
      return false; // Ou lançar NotFoundException
    }

    const ownerId = record.userId || record.ownerId;

    if (record && ownerId === user.id) {
      return true;
    }

    throw new ForbiddenException(
      'Você não tem permissão para acessar este recurso.',
    );
  }
}
