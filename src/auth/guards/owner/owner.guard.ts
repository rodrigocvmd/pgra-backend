import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { BookingService } from 'src/booking/booking.service';

@Injectable()
export class OwnerGuard implements CanActivate {
  constructor(private bookingService: BookingService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;

    const bookingId = request.params.id;

    const isOwner = await this.bookingService.checkOwnership(bookingId, userId);

    if (!isOwner) {
      throw new ForbiddenException(
        'Você não tem permissão para modificar esta reserva.',
      );
    }
    return true;
  }
}
