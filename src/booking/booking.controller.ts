import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import type { AuthRequest } from 'src/auth/types';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { OwnerGuard } from 'src/auth/guards/owner/owner.guard';
import { Entity } from 'src/auth/guards/owner/entity.decorator';

@UseGuards(JwtAuthGuard)
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @UsePipes(ValidationPipe)
  create(
    @Body() createBookingDto: CreateBookingDto,
    @Req() request: AuthRequest,
  ) {
    return this.bookingService.create(createBookingDto, request.user.id);
  }

  @Get()
  findAll() {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Get('me')
  getBookingsByUser(@Req() request: AuthRequest) {
    return this.bookingService.getBookingsByUser(request.user.id);
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  @Entity('reservation')
  update(
    @Param('id') id: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  @Entity('reservation')
  remove(@Param('id') id: string) {
    return this.bookingService.remove(id);
  }
}
