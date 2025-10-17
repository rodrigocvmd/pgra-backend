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
import type { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner/owner.guard';
import { Entity } from 'src/auth/guards/owner/entity.decorator';

@UseGuards(JwtAuthGuard)
@Controller('resource')
export class ResourceController {
  constructor(private readonly resourceService: ResourceService) {}

  @Post()
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
    return this.resourceService.update(
      resourceId,
      updateResourceDto,
    );
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @Entity('resource')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(id);
  }
}
