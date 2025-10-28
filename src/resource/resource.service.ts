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
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResourceService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async create(createResourceDto: CreateResourceDto, ownerId: string) {
    return this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.user.findUnique({
        where: { id: ownerId },
      });

      if (!user) {
        throw new NotFoundException('Usuário não encontrado.');
      }

      let newAccessToken: string | null = null;

      // Se o usuário for um USER, promova-o a OWNER e gere um novo token.
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

      return { resource, newAccessToken };
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
