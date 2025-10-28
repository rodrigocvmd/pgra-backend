import { Request as ExpressRequest } from 'express';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends ExpressRequest {
  user: AuthUser;
}