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
import { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner/owner.guard';
import { Entity } from 'src/auth/guards/owner/entity.decorator';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  @UsePipes(ValidationPipe)
  create(
    @Body() createResourceDto: CreateResourceDto,
    @Req() request: AuthRequest,
  ) {
    return this.resourceService.create(createResourceDto, request.user.id);
  }

  @Get()
  findAll() {
    return this.resourceService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourceService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  @UsePipes(ValidationPipe)
  update(
    @Param('id') resourceId: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourceService.update(resourceId, updateResourceDto);
  }

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { CreateBlockedDto } from './dto/create-blocked.dto';

// ... (existing imports)

// ... (inside ResourceController class)
  @Delete(':id')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }

  @Post(':id/availability')
  @UseGuards(OwnerGuard)
  @Entity('resource')
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
  @UsePipes(ValidationPipe)
  addBlockedPeriod(
    @Param('id') resourceId: string,
    @Body() createBlockedDto: CreateBlockedDto,
  ) {
    return this.resourceService.addBlockedPeriod(resourceId, createBlockedDto);
  }
}
