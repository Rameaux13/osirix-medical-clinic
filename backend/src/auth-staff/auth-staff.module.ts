import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthStaffController } from './auth-staff.controller';
import { AuthStaffService } from './auth-staff.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'osirix-secret-key-2025',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthStaffController],
  providers: [AuthStaffService, PrismaService],
  exports: [AuthStaffService, JwtModule], // ← AJOUTE JwtModule
})
export class AuthStaffModule {}