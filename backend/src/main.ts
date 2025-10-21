import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
   
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.9:3000',
      'http://127.0.0.1:3000'
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Servir les fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3001);
  console.log('🚀 Backend on http://localhost:3001');
  console.log('📁 Uploads: ' + join(process.cwd(), 'uploads'));
}
bootstrap();