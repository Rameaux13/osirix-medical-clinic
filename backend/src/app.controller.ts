import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('users')
  async getUsers() {
    return await this.prisma.user.findMany();
  }

  @Post('seed')
  async seedDatabase() {
    // Créer les données de test
    const admin = await this.prisma.admin.create({
      data: {
        email: 'admin@osirix-medical.com',
        passwordHash: 'admin123',
        firstName: 'Admin',
        lastName: 'OSIRIX',
        role: 'super_admin'
      }
    });

    const doctor = await this.prisma.doctor.create({
      data: {
        email: 'dr.martin@osirix-medical.com',
        passwordHash: 'doctor123',
        firstName: 'Dr. Jean',
        lastName: 'Martin',
        speciality: 'Médecine Générale'
      }
    });

    const patient = await this.prisma.user.create({
      data: {
        email: 'patient@test.com',
        passwordHash: 'patient123',
        firstName: 'Jean',
        lastName: 'Dupont',
        phone: '0123456789'
      }
    });

    return { admin, doctor, patient };
  }
}