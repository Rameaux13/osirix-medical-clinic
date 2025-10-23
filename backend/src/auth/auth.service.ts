import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private mailService: MailService, // 🆕 Injection du service Mail
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

  // ========================
  // 🆕 MOT DE PASSE OUBLIÉ
  // ========================

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Vérifier si l'utilisateur existe
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // ⚠️ Pour la sécurité, on ne révèle pas si l'email existe ou non
      return {
        success: true,
        message: 'Si cet email existe, un lien de réinitialisation a été envoyé.',
      };
    }

    // Générer un token unique (32 caractères aléatoires)
    const resetToken = randomBytes(32).toString('hex');
    
    // Le token expire dans 1 heure
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 heure

    // Sauvegarder le token dans la base de données
    await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpiry,
      },
    });

    // Envoyer l'email avec le lien de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    await this.mailService.sendPasswordResetEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      resetUrl,
    );

    return {
      success: true,
      message: 'Un email de réinitialisation a été envoyé.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    // Chercher l'utilisateur avec ce token valide (non expiré)
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(), // Token non expiré
        },
      },
    });

    if (!user) {
      throw new BadRequestException(
        'Token invalide ou expiré. Veuillez refaire une demande de réinitialisation.',
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour le mot de passe et supprimer le token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return {
      success: true,
      message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.',
    };
  }
}