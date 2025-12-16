// Importe as classes necessárias
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.includes('?')
              ? `${process.env.DATABASE_URL}&pgbouncer=true`
              : `${process.env.DATABASE_URL}?pgbouncer=true`
            : undefined,
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
}