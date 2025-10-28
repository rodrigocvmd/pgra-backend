import { IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  resourceId: string;
}
