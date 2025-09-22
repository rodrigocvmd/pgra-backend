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
import { AuthGuard } from '@nestjs/passport';
import { ResourceService } from './resource.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import type { AuthRequest } from 'src/auth/types';

@UseGuards(AuthGuard('jwt'))
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
    return this.resourceService.findOne(+id);
  }

  @Patch(':id')
  @UsePipes(ValidationPipe)
  update(
    @Param('id') resourceId: string,
    @Req() request: AuthRequest,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    return this.resourceService.update(
      resourceId,
      request.user.id,
      updateResourceDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.resourceService.remove(+id);
  }
}
