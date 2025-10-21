import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // Hasher un mot de passe
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  // Comparer un mot de passe
  private async comparePassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Générer un token JWT
  private generateToken(userId: string, email: string, userType: string) {
    const payload = { userId, email, userType };
    return this.jwtService.sign(payload);
  }

  // Inscription d'un patient
  async registerPatient(registerDto: RegisterDto) {
    const { email, password, firstName, lastName, phone, dateOfBirth } = registerDto;

    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà');
    }


    // Vérifier si le téléphone existe déjà (seulement si fourni)
    if (phone) {
      const existingUserByPhone = await this.prisma.user.findFirst({
        where: { phone },
      });

      if (existingUserByPhone) {
        throw new ConflictException('Ce numéro de téléphone est déjà utilisé par un autre compte');
      }
    }

    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer le patient
    const newPatient = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    // Générer le token
    const token = this.generateToken(newPatient.id, newPatient.email, 'patient');

    return {
      message: 'Compte patient créé avec succès',
      user: newPatient,
      token,
      userType: 'patient',
    };
  }

  // Connexion universelle (patients, doctors, admins)
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Chercher dans la table des patients
    const patient = await this.prisma.user.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        passwordHash: true, 
        firstName: true, 
        lastName: true, 
        phone: true, 
        dateOfBirth: true 
      },
    });

    if (patient) {
      // Vérifier le mot de passe
      const isPasswordValid = await this.comparePassword(password, patient.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Enlever le passwordHash des données retournées
      const { passwordHash, ...userWithoutPassword } = patient;

      // Générer le token
      const token = this.generateToken(patient.id, patient.email, 'patient');

      return {
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token,
        userType: 'patient',
      };
    }

    // Chercher dans la table des médecins
    const doctor = await this.prisma.doctor.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        passwordHash: true, 
        firstName: true, 
        lastName: true, 
        speciality: true 
      },
    });

    if (doctor) {
      // Vérifier le mot de passe
      const isPasswordValid = await this.comparePassword(password, doctor.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Enlever le passwordHash des données retournées
      const { passwordHash, ...userWithoutPassword } = doctor;

      // Générer le token
      const token = this.generateToken(doctor.id, doctor.email, 'doctor');

      return {
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token,
        userType: 'doctor',
      };
    }

    // Chercher dans la table des admins
    const admin = await this.prisma.admin.findUnique({
      where: { email },
      select: { 
        id: true, 
        email: true, 
        passwordHash: true, 
        firstName: true, 
        lastName: true, 
        role: true 
      },
    });

    if (admin) {
      // Vérifier le mot de passe
      const isPasswordValid = await this.comparePassword(password, admin.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect');
      }

      // Enlever le passwordHash des données retournées
      const { passwordHash, ...userWithoutPassword } = admin;

      // Générer le token
      const token = this.generateToken(admin.id, admin.email, 'admin');

      return {
        message: 'Connexion réussie',
        user: userWithoutPassword,
        token,
        userType: 'admin',
      };
    }

    // Aucun utilisateur trouvé
    throw new UnauthorizedException('Email ou mot de passe incorrect');
  }

  // Valider un utilisateur (utilisé par la stratégie JWT)
  async validateUser(userId: string, userType: string) {
    if (userType === 'patient') {
      return this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          dateOfBirth: true,
        },
      });
    }

    if (userType === 'doctor') {
      return this.prisma.doctor.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          speciality: true,
        },
      });
    }

    if (userType === 'admin') {
      return this.prisma.admin.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });
    }

    return null;
  }
  // Vérifier la disponibilité de l'email
async checkEmailAvailability(email: string) {
  const existingUser = await this.prisma.user.findUnique({
    where: { email },
  });
  
  return {
    available: !existingUser,
    message: existingUser ? 'Email déjà utilisé' : 'Email disponible'
  };
}

// Vérifier la disponibilité du téléphone
async checkPhoneAvailability(phone: string) {
  const existingUser = await this.prisma.user.findFirst({
    where: { phone },
  });
  
  return {
    available: !existingUser,
    message: existingUser ? 'Téléphone déjà utilisé' : 'Téléphone disponible'
  };
}

}