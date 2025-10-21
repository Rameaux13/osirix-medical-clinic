import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { AuthStaffModule } from './auth-staff/auth-staff.module'; // 🆕 NOUVEAU
import { UsersModule } from './users/users.module';
import { DoctorsModule } from './doctors/doctors.module';
import { AdminsModule } from './admins/admins.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PrescriptionsModule } from './prescriptions/prescriptions.module';
import { LabOrdersModule } from './lab-orders/lab-orders.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AuthStaffModule, // 🆕 NOUVEAU
    UsersModule,
    DoctorsModule,
    AdminsModule,
    AppointmentsModule,
    MedicalRecordsModule,
    NotificationsModule,
    ReviewsModule,
    LabOrdersModule,
    PrescriptionsModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}