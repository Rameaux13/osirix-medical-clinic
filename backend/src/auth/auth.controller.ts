import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Inscription d'un nouveau patient
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.registerPatient(registerDto);
  }

  // Connexion (patients, doctors, admins)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // NOUVELLES ROUTES - Vérification disponibilité
  @Post('check-email')
  @HttpCode(HttpStatus.OK)
  async checkEmailAvailability(@Body() body: { email: string }) {
    return this.authService.checkEmailAvailability(body.email);
  }

  @Post('check-phone')
  @HttpCode(HttpStatus.OK)
  async checkPhoneAvailability(@Body() body: { phone: string }) {
    return this.authService.checkPhoneAvailability(body.phone);
  }

  // Route protégée pour tester le JWT (récupérer le profil utilisateur)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return {
      message: 'Profil récupéré avec succès',
      user: req.user,
    };
  }

  // Route de test pour vérifier que le JWT fonctionne
  @Get('test-protected')
  @UseGuards(JwtAuthGuard)
  testProtected(@Request() req) {
    return {
      message: 'Route protégée accessible !',
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }
}