import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CreateBlockedDto } from './dto/create-blocked.dto';

@Injectable()
export class ResourceService {
  constructor(private prismaService: PrismaService) {}

  async create(createResourceDto: CreateResourceDto, ownerId: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        // Embora o JwtAuthGuard deva impedir isso, é uma boa prática de segurança.
        throw new NotFoundException('Usuário não encontrado.');
      }

      // Se o usuário for um USER, promova-o a OWNER.
      if (user.role === 'USER') {
        await prisma.user.update({
          where: { id: ownerId },
          data: { role: 'OWNER' },
        });
      }

      // Crie o recurso.
      const resource = await prisma.resource.create({
        data: {
          name: createResourceDto.name,
          description: createResourceDto.description,
          pricePerHour: createResourceDto.pricePerHour,
          owner: {
            connect: { id: ownerId },
          },
        },
      });

      return resource;
    });
  }

  async findOne(id: string) {
    return this.prismaService.resource.findUnique({
      where: {
        id,
      },
    });
  }

  findAll() {
    return this.prismaService.resource.findMany();
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

  async addAvailability(
    resourceId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.prismaService.availability.create({
      data: {
        resourceId,
        ...createAvailabilityDto,
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
}
