import { Module } from '@nestjs/common';
import { AdminsService } from './admins.service';
import { AdminsController } from './admins.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AdminsController],
  providers: [AdminsService, PrismaService],
  exports: [AdminsService], // Exporter pour utiliser dans d'autres modules
})
export class AdminsModule {}