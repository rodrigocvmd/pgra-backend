import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthUser } from 'src/auth/types';
import { ReservationStatus, UserRole } from '@prisma/client';

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
    const { resourceId } = createBookingDto;
    const startTime = new Date(createBookingDto.startTime);
    const endTime = new Date(createBookingDto.endTime);

    const resource = await this.prismaService.resource.findUnique({
      where: {
        id: resourceId,
      },
    });
    if (!resource) {
      throw new NotFoundException('Recurso não encontrado');
    }

    // 1. Verificar períodos bloqueados
    const blockedPeriod = await this.prismaService.blocked.findFirst({
      where: {
        resourceId,
        AND: [
          { blockedEnd: { gt: startTime } },
          { blockedStart: { lt: endTime } },
        ],
      },
    });

    if (blockedPeriod) {
      throw new ForbiddenException(
        'O recurso está bloqueado neste período.',
      );
    }

    // 3. Verificar reservas conflitantes (lógica existente)
    const durationInHours =
      (endTime.getTime() - startTime.getTime()) / 3600000;
    const calculatedPrice = durationInHours * resource.pricePerHour.toNumber();
    const conflictingBooking = await this.prismaService.reservation.findFirst({
      where: {
        resourceId: resourceId,
        AND: [
          { endTime: { gt: startTime } },
          { startTime: { lt: endTime } },
        ],
      },
    });
    if (conflictingBooking) {
      throw new ForbiddenException('Recurso já reservado neste período');
    }
    return this.prismaService.reservation.create({
      data: {
        startTime,
        endTime,
        resourceId,
        userId: userId,
        totalPrice: calculatedPrice,
      },
    });
  }

  findAll() {
    return this.prismaService.reservation.findMany();
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
    return this.prismaService.reservation.findMany({
      where: {
        userId,
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getBookingsForOwner(ownerId: string) {
    return this.prismaService.reservation.findMany({
      where: {
        resource: {
          ownerId,
        },
      },
      include: {
        resource: {
          select: {
            id: true,
            name: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async confirmBooking(id: string, user: AuthUser) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    if (
      user.role !== UserRole.ADMIN &&
      reservation.resource.ownerId !== user.id
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para confirmar esta reserva.',
      );
    }

    return this.prismaService.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CONFIRMADO },
    });
  }

  async cancelBooking(id: string, user: AuthUser) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
      include: { resource: true },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    const isOwner = reservation.resource.ownerId === user.id;
    const isUser = reservation.userId === user.id;

    if (user.role !== UserRole.ADMIN && !isOwner && !isUser) {
      throw new ForbiddenException(
        'Você não tem permissão para cancelar esta reserva.',
      );
    }

    return this.prismaService.reservation.update({
      where: { id },
      data: { status: ReservationStatus.CANCELADO },
    });
  }

  async update(
    reservationId: string,
    updateBookingDto: UpdateBookingDto,
  ) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    const resource = await this.prismaService.resource.findUnique({
      where: { id: reservation.resourceId },
    });
    if (!resource) {
      throw new NotFoundException('Recurso não encontrado.');
    }
    
    // Converte as strings para Datas, se existirem
    const newStartTime = updateBookingDto.startTime ? new Date(updateBookingDto.startTime) : reservation.startTime;
    const newEndTime = updateBookingDto.endTime ? new Date(updateBookingDto.endTime) : reservation.endTime;

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
      data: { 
        ...updateBookingDto, 
        startTime: newStartTime,
        endTime: newEndTime,
        totalPrice: calculatedPrice 
      },
    });
  }

  async remove(id: string) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: { id },
    });

    if (!reservation) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    return await this.prismaService.reservation.delete({
      where: { id },
    });
  }
}
