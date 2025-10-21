import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsDateString
} from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  @MaxLength(100, { message: 'L\'email ne peut pas dépasser 100 caractères' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(3, { message: 'Le mot de passe doit contenir au moins 3 caractères' })
  @MaxLength(50, { message: 'Le mot de passe ne peut pas dépasser 50 caractères' })
  @Matches(
    /^[a-zA-Z0-9]+$/,
    {
      message: 'Le mot de passe ne peut contenir que des lettres et des chiffres'
    }
  )
  password: string;

  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  @MinLength(2, { message: 'Le prénom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le prénom ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s-']+$/, {
    message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  })
  firstName: string;

  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'Le nom ne peut pas dépasser 50 caractères' })
  @Matches(/^[a-zA-ZÀ-ÿ\s-']+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  })
  lastName: string;

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