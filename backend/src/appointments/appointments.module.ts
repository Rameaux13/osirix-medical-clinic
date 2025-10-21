import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // 🆕 AJOUTER
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    NotificationsModule,
    JwtModule.register({ // 🆕 AJOUTER
      secret: process.env.JWT_SECRET || 'osirix-secret-key-2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService, PrismaService],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}