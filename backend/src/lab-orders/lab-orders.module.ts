import { Module } from '@nestjs/common';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthStaffModule } from '../auth-staff/auth-staff.module'; // ← AJOUTE

@Module({
  imports: [AuthStaffModule], // ← REMPLACE JwtModule.register par AuthStaffModule
  controllers: [LabOrdersController],
  providers: [LabOrdersService, PrismaService],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}