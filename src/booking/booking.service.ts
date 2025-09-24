import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
// import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}
  async create(createBookingDto: CreateBookingDto, userId: string) {
    const resource = await this.prismaService.resource.findUnique({
      where: {
        id: createBookingDto.resourceId,
      },
    });
    if (!resource) {
      throw new NotFoundException('Recurso não encontrado');
    }

    const durationInHours =
      (createBookingDto.endTime.getTime() -
        createBookingDto.startTime.getTime()) /
      3600000;
    const calculatedPrice = durationInHours * resource.pricePerHour.toNumber();
    const conflictingBooking = await this.prismaService.reservation.findFirst({
      where: {
        resourceId: createBookingDto.resourceId,
        AND: [
          { endTime: { gt: createBookingDto.startTime } },
          { startTime: { lt: createBookingDto.endTime } },
        ],
      },
    });
    if (conflictingBooking) {
      throw new ForbiddenException('Recurso já reservado neste período');
    }
    return this.prismaService.reservation.create({
      data: {
        startTime: createBookingDto.startTime,
        endTime: createBookingDto.endTime,
        resourceId: createBookingDto.resourceId,
        userId: userId,
        totalPrice: calculatedPrice,
      },
    });
  }

  // findAll() {
  //   return `This action returns all booking`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} booking`;
  // }

  // update(id: number, updateBookingDto: UpdateBookingDto) {
  //   return `This action updates a #${id} booking`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} booking`;
  // }
}
