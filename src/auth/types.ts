import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';

export interface AuthRequest extends ExpressRequest {
  user: User;
}