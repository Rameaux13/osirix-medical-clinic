import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
import { AuthStaffService } from './auth-staff.service';
import { StaffRegisterDto } from './dto/staff-register.dto';
import { StaffLoginDto } from './dto/staff-login.dto';

@Controller('auth/staff')
export class AuthStaffController {
  constructor(private readonly authStaffService: AuthStaffService) {}

  /**
   * POST /auth/staff/register
   * Inscription du personnel (Secrétaire, Médecin, Laborantin)
   */
  @Post('register')
  async register(@Body(ValidationPipe) dto: StaffRegisterDto) {
    return this.authStaffService.register(dto);
  }

  /**
   * POST /auth/staff/login
   * Connexion du personnel avec email OU téléphone
   */
  @Post('login')
  async login(@Body(ValidationPipe) dto: StaffLoginDto) {
    return this.authStaffService.login(dto);
  }
}