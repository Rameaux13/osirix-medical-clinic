import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
import { AuthStaffModule } from './auth-staff/auth-staff.module';
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
import { MailerModule } from '@nestjs-modules/mailer'; 
import { FeedbackModule } from './feedback/feedback.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ✅ AJOUTER LE MAILER MODULE ICI
    MailerModule.forRoot({
      transport: {
        host: process.env.MAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.MAIL_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASSWORD,
        },
      },
      defaults: {
        from: `"OSIRIX Clinique Médical" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      },
    }),
    AuthModule,
    AuthStaffModule,
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
    FeedbackModule, // ✅ Module Feedback
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}