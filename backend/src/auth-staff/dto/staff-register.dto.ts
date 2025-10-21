import { IsEmail, IsString, IsNotEmpty, MinLength, Matches, IsEnum } from 'class-validator';

export enum UserRole {
  SECRETARY = 'SECRETARY',
  DOCTOR = 'DOCTOR',
  LABORANTIN = 'LABORANTIN',
}

export class StaffRegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  lastName: string;

  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  @Matches(/^(\+225\d{10}|\d{10})$/, {
    message: 'Format téléphone invalide. Utilisez +225XXXXXXXXXX ou 10 chiffres',
  })
  phone: string;

  @IsString()
  @MinLength(3, { message: 'Le mot de passe doit contenir au moins 3 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le genre est obligatoire' })
  @Matches(/^(HOMME|FEMME|AUTRE)$/i, {
    message: 'Le genre doit être : HOMME, FEMME ou AUTRE',
  })
  gender: string;

  @IsEnum(UserRole, { message: 'Rôle invalide. Choisissez : SECRETARY, DOCTOR ou LABORANTIN' })
  @IsNotEmpty({ message: 'Le rôle est obligatoire' })
  role: UserRole;
}