import {
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsDateString
} from 'class-validator';

/**
 * DTO pour la mise à jour du profil patient
 * Champs modifiables : firstName, lastName, phone, dateOfBirth
 * L'email n'est PAS modifiable pour des raisons de sécurité
 */
export class UpdateProfileDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Le prénom ne peut pas être vide' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s-']+$/, {
    message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  })
  firstName?: string;

  @IsOptional()
  @IsNotEmpty({ message: 'Le nom ne peut pas être vide' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s-']+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  })
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber('CI', { message: 'Format de téléphone invalide (format ivoirien attendu)' })
  phone?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Format de date invalide (YYYY-MM-DD attendu)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD'
  })
  dateOfBirth?: string;
}