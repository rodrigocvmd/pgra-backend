import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BookingService {
  constructor(private prismaService: PrismaService) {}

  async checkOwnership(id: string, userId: string): Promise<boolean> {
    const reservation = await this.prismaService.reservation.findUnique({
      where: {
        id,
      },
      select: {
        userId: true,
      },
    });
    return reservation ? reservation.userId === userId : false;
  }

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

  findAll() {
    return `This action returns all booking`;
  }

  async findOne(id: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: {
        id,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }
    return reservation;
  }

  async getBookingsByUser(userId: string) {
    const reservation = await this.prismaService.reservation.findMany({
      where: {
        userId,
      },
    });
    return reservation;
  }

  async update(
    reservationId: string,
    userId: string,
    updateBookingDto: UpdateBookingDto,
  ) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Recurso não encontrado.');
    }

    const resource = await this.prismaService.resource.findUnique({
      where: { id: reservation.resourceId },
    });
    if (!resource) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    const newEndTime = updateBookingDto.endTime || reservation.endTime;
    const newStartTime = updateBookingDto.startTime || reservation.startTime;

    const durationInHours =
      (newEndTime.getTime() - newStartTime.getTime()) / 3600000;
    const calculatedPrice = durationInHours * resource.pricePerHour.toNumber();

    const conflictingBooking = await this.prismaService.reservation.findFirst({
      where: {
        resourceId: reservation.resourceId,

        NOT: {
          id: reservationId,
        },

        AND: [
          { endTime: { gt: newStartTime } },
          { startTime: { lt: newEndTime } },
        ],
      },
    });

    if (conflictingBooking) {
      throw new ForbiddenException('Recurso já reservado neste período');
    }

    return this.prismaService.reservation.update({
      where: { id: reservationId },
      data: { ...updateBookingDto, totalPrice: calculatedPrice },
    });
  }

  async remove(id: string, userId: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }
    if (reservation.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para deletar esta reserva.',
      );
    }
    return await this.prismaService.reservation.delete({
      where: { id },
    });
  }
}
