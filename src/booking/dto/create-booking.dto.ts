import { IsNotEmpty, IsDate, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsDate()
  @IsNotEmpty()
  startTime: Date;

  @IsDate()
  @IsNotEmpty()
  endTime: Date;

  @IsString()
  @IsNotEmpty()
  resourceId: string;
}
