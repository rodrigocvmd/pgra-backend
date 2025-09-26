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
  @UsePipes(ValidationPipe)
  getBookingsByUser(@Req() request: AuthRequest) {
    return this.bookingService.getBookingsByUser(request.user.id);
  }

  @Patch(':id')
  @UseGuards(OwnerGuard)
  update(
    @Param('id') id: string,
    @Req() request: AuthRequest,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingService.update(id, request.user.id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(OwnerGuard)
  remove(@Param('id') id: string, @Req() request: AuthRequest) {
    return this.bookingService.remove(id, request.user.id);
  }
}
