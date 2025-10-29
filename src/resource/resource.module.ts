import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';
import { AuthModule } from 'src/auth/auth.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    AuthModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [ResourceController],
  providers: [ResourceService],
})
export class ResourceModule {}
