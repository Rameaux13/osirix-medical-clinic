import { Module } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { DoctorsController } from './doctors.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [DoctorsController],
  providers: [DoctorsService, PrismaService],
  exports: [DoctorsService], // Exporter pour utiliser dans d'autres modules
})
export class DoctorsModule {}