import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
   
  // CORS pour production et développement
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://192.168.1.9:3000',
      'http://127.0.0.1:3000',
      'https://osirix-frontend.vercel.app', // Frontend en production
      /\.vercel\.app$/ // Tous les domaines Vercel
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Servir les fichiers statiques
  // Fonctionne sur Render.com et en développement local
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  // Port dynamique pour Vercel
  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`🚀 Backend on port ${port}`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();