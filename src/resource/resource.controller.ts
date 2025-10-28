import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CreateBlockedDto } from './dto/create-blocked.dto';
import type { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner/owner.guard';
import { Entity } from 'src/auth/guards/owner/entity.decorator';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { UserRole } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('resources')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @ApiOperation({
    summary: 'Cria um novo recurso',
    description:
      'Se um usuário com a role USER criar um recurso, ele será promovido a OWNER.',
  })
  @UsePipes(ValidationPipe)
  create(
    @Body() createResourceDto: CreateResourceDto,
    @Req() request: AuthRequest,
  ) {
    return this.resourceService.create(createResourceDto, request.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os recursos' })
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um recurso pelo ID' })
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  @ApiOperation({
    summary: 'Atualiza um recurso',
    description: 'Apenas o proprietário do recurso ou um ADMIN pode atualizá-lo.',
  })
  @UsePipes(ValidationPipe)
  update(
    @Param('id') resourceId: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourceService.update(resourceId, updateResourceDto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  @ApiOperation({
    summary: 'Remove um recurso',
    description: 'Apenas o proprietário do recurso ou um ADMIN pode removê-lo.',
  })
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }

  @Post(':id/availability')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  @ApiOperation({
    summary: 'Adiciona um período de disponibilidade a um recurso',
    description: 'Apenas o proprietário do recurso ou um ADMIN pode fazer isso.',
  })
  @UsePipes(ValidationPipe)
  addAvailability(
    @Param('id') resourceId: string,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.resourceService.addAvailability(
      resourceId,
      createAvailabilityDto,
    );
  }

  @Post(':id/block')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  @ApiOperation({
    summary: 'Adiciona um período de bloqueio a um recurso',
    description: 'Apenas o proprietário do recurso ou um ADMIN pode fazer isso.',
  })
  @UsePipes(ValidationPipe)
  addBlockedPeriod(
    @Param('id') resourceId: string,
    @Body() createBlockedDto: CreateBlockedDto,
  ) {
    return this.resourceService.addBlockedPeriod(resourceId, createBlockedDto);
  }
}