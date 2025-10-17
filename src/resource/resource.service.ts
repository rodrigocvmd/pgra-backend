import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ResourceService {
  constructor(private prismaService: PrismaService) {}

  async create(createResourceDto: CreateResourceDto, ownerId: string) {
    return this.prismaService.resource.create({
      data: {
        name: createResourceDto.name,
        description: createResourceDto.description,
        pricePerHour: createResourceDto.pricePerHour,
        owner: {
          connect: { id: ownerId },
        },
      },
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
}
