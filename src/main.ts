import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Habilita o CORS para permitir requisições do frontend
  app.enableCors();

  // Configura a pasta 'uploads' para servir arquivos estáticos
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Configura o ValidationPipe globalmente para validação e transformação de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove propriedades que não estão no DTO
      transform: true, // Transforma o payload para a instância do DTO
    }),
  );

  // Configura o Swagger para a documentação da API
  const config = new DocumentBuilder()
    .setTitle('Plataforma de Reservas API')
    .setDescription('Documentação da API para a Plataforma de Reservas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Inicia a aplicação na porta 3001
  await app.listen(3001);
}

bootstrap();