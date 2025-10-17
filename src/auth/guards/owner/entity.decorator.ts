import { SetMetadata } from '@nestjs/common';

export const Entity = (entity: string) => SetMetadata('entity', entity);
