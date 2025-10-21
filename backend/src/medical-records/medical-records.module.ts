import { Module } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';
import { MedicalRecordsController } from './medical-records.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module'; // NOUVEAU

@Module({
  imports: [NotificationsModule], // NOUVEAU : Importer le module notifications
  controllers: [MedicalRecordsController],
  providers: [MedicalRecordsService, PrismaService],
  exports: [MedicalRecordsService],
})
export class MedicalRecordsModule {}