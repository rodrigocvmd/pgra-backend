// Importe as classes necessárias
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    const url = process.env.DATABASE_URL;

    super(
      url
        ? {
            datasources: {
              db: {
                url: url.includes('?')
                  ? `${url}&pgbouncer=true`
                  : `${url}?pgbouncer=true`,
              },
            },
          }
        : undefined,
    );
  }

  async onModuleInit() {
    await this.$connect();
  }
}