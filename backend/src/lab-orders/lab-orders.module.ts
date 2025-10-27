import { Module } from '@nestjs/common';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthStaffModule } from '../auth-staff/auth-staff.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [AuthStaffModule, CloudinaryModule],
  controllers: [LabOrdersController],
  providers: [LabOrdersService, PrismaService],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}