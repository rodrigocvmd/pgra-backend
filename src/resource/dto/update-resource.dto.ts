import { PartialType } from '@nestjs/mapped-types';
import { CreateResourceDto } from './create-resource.dto';
import { IsOptional, IsUrl } from 'class-validator';

export class UpdateResourceDto extends PartialType(CreateResourceDto) {
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
