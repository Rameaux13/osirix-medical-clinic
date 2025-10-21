// C:\Users\DELL\Desktop\osirix\backend\src\reviews\reviews.module.ts

import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [],
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService],
  exports: [ReviewsService], // Exporter pour utilisation dans d'autres modules
})
export class ReviewsModule {}