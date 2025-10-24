// C:\Users\DELL\Desktop\osirix\backend\src\reviews\reviews.module.ts

import { Module } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from '../auth/auth.module'; // ✅ AJOUT

@Module({
  imports: [
    AuthModule, // ✅ REMPLACE PassportModule + JwtModule par AuthModule
  ],
  controllers: [ReviewsController],
  providers: [ReviewsService, PrismaService],
  exports: [ReviewsService],
})
export class ReviewsModule {}