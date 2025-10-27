import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Trimite răspunsuri JSON cu indentare (doar în dev)
  app.setGlobalPrefix('api'); // prefix pentru toate rutele -> /api/...

  // Pipe global pentru a activa validarea DTO-urilor (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimină proprietățile care nu sunt în DTO
      forbidNonWhitelisted: false,
      transform: true, // transformă payload în instanțe tipate (p. ex. string -> number)
    }),
  );

  await app.listen(3000);
  console.log('Backend running on http://localhost:3000/api');
}
bootstrap();
