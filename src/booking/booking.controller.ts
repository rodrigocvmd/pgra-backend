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
import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
import { Roles } from 'src/auth/guards/roles/roles.decorator';
import { UserRole } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
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
  @Roles(UserRole.ADMIN)
  findAll() {
    return this.bookingService.findAll();
  }

  @Get('me')
  getBookingsByUser(@Req() request: AuthRequest) {
    return this.bookingService.getBookingsByUser(request.user.id);
  }

  @Get('my-resources-bookings')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  getBookingsForMyResources(@Req() request: AuthRequest) {
    return this.bookingService.getBookingsForOwner(request.user.id);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  findOne(@Param('id') id: string) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id/confirm')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  confirm(@Param('id') id: string, @Req() request: AuthRequest) {
    return this.bookingService.confirmBooking(id, request.user);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.OWNER, UserRole.USER)
  cancel(@Param('id') id: string, @Req() request: AuthRequest) {
    return this.bookingService.cancelBooking(id, request.user);
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
