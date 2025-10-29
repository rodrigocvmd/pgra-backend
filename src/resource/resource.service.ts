import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBlockedDto } from './dto/create-blocked.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResourceService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(
    createResourceDto: CreateResourceDto,
    ownerId: string,
    file?: any,
  ) {
    return this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      let newAccessToken: string | null = null;

      if (user.role === 'USER') {
        const updatedUser = await prisma.user.update({
          where: { id: ownerId },
          data: { role: 'OWNER' },
        });

        const payload = {
          sub: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
        };
        newAccessToken = this.jwtService.sign(payload);
      }

      const resource = await prisma.resource.create({
        data: {
          name: createResourceDto.name,
          description: createResourceDto.description,
          pricePerHour: parseFloat(createResourceDto.pricePerHour as any),
          imageUrl: file ? `/uploads/${file.filename}` : null,
          owner: {
            connect: { id: ownerId },
          },
        },
      });

      return { resource, newAccessToken };
    });
  }

  async findOne(id: string) {
    return this.prismaService.resource.findUnique({
      where: {
        id,
      },
      include: {
        Blocked: true, // O nome do modelo no Prisma é 'Blocked' com 'B' maiúsculo
      },
    });
  }

  findAll(filters?: {
    availableFrom?: string;
    availableTo?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      availableFrom,
      availableTo,
      minPrice,
      maxPrice,
      sortBy,
      sortOrder,
    } = filters || {};

    const where: any = {};

    if (minPrice || maxPrice) {
      where.pricePerHour = {};
      if (minPrice) {
        where.pricePerHour.gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        where.pricePerHour.lte = parseFloat(maxPrice);
      }
    }

    if (availableFrom && availableTo) {
      const from = new Date(availableFrom);
      const to = new Date(availableTo);

      where.bookings = {
        none: {
          OR: [
            // Case 1: Booking starts within the range
            {
              startTime: { gte: from, lt: to },
            },
            // Case 2: Booking ends within the range
            {
              endTime: { gt: from, lte: to },
            },
            // Case 3: Booking envelops the range
            {
              startTime: { lte: from },
              endTime: { gte: to },
            },
          ],
        },
      };
    }

    const orderBy =
      sortBy && sortOrder
        ? {
            [sortBy]: sortOrder,
          }
        : undefined;

    return this.prismaService.resource.findMany({
      where,
      orderBy,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findMyResources(ownerId: string) {
    return this.prismaService.resource.findMany({
      where: {
        ownerId,
      },
    });
  }

  async update(
    resourceId: string,
    updateResourceDto: UpdateResourceDto,
  ) {
    const resource = await this.prismaService.resource.findUnique({
      where: { id: resourceId },
    });

    if (!resource) {
      throw new NotFoundException('Recurso não encontrado.');
    }

    return this.prismaService.resource.update({
      where: { id: resourceId },
      data: updateResourceDto,
    });
  }

  async remove(id: string) {
    const resource = await this.prismaService.resource.findUnique({
      where: { id },
    });

    if (!resource) {
      throw new NotFoundException('Recurso não encontrado');
    }

    return await this.prismaService.resource.delete({
      where: {
        id,
      },
    });
  }

  async addBlockedPeriod(
    resourceId: string,
    createBlockedDto: CreateBlockedDto,
  ) {
    return this.prismaService.blocked.create({
      data: {
        resourceId,
        ...createBlockedDto,
      },
    });
  }

  async removeBlockedPeriod(blockedId: string) {
    const blocked = await this.prismaService.blocked.findUnique({
      where: { id: blockedId },
    });

    if (!blocked) {
      throw new NotFoundException('Período bloqueado não encontrado.');
    }

    return this.prismaService.blocked.delete({
      where: { id: blockedId },
    });
  }
}
