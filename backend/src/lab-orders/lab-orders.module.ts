import { Module, forwardRef } from '@nestjs/common';
import { LabOrdersController } from './lab-orders.controller';
import { LabOrdersService } from './lab-orders.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthStaffModule } from '../auth-staff/auth-staff.module';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    AuthStaffModule,
    CloudinaryModule,
    forwardRef(() => NotificationsModule), // ✅ Ajout du module des notifications
  ],
  controllers: [LabOrdersController],
  providers: [LabOrdersService, PrismaService],
  exports: [LabOrdersService],
})
export class LabOrdersModule {}