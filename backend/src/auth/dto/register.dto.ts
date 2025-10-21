import { 
  IsEmail, 
  IsNotEmpty, 
  IsOptional, 
  MinLength, 
  MaxLength,
  Matches,
  IsPhoneNumber,
  IsDateString,
  IsIn,
  ValidateIf
} from 'class-validator';

export class RegisterDto {
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

  @IsNotEmpty({ message: 'Le téléphone est obligatoire' })
  @IsPhoneNumber('CI', { message: 'Format de téléphone invalide (ex: +225 01 02 03 04 05)' })
  phone: string;

  @IsNotEmpty({ message: 'La date de naissance est obligatoire' })
  @IsDateString({}, { message: 'Format de date invalide (YYYY-MM-DD attendu)' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La date doit être au format YYYY-MM-DD'
  })
  dateOfBirth: string;

  @IsNotEmpty({ message: 'Le genre est obligatoire' })
  @IsIn(['male', 'female', 'other'], { message: 'Le genre doit être male, female ou other' })
  gender: string;

  @IsNotEmpty({ message: 'L\'adresse est obligatoire' })
  @MinLength(5, { message: 'L\'adresse doit contenir au moins 5 caractères' })
  @MaxLength(200, { message: 'L\'adresse ne peut pas dépasser 200 caractères' })
  address: string;

  @IsNotEmpty({ message: 'La ville est obligatoire' })
  @MinLength(2, { message: 'La ville doit contenir au moins 2 caractères' })
  @MaxLength(50, { message: 'La ville ne peut pas dépasser 50 caractères' })
  city: string;

  // CHAMPS MÉDICAUX OPTIONNELS
  @IsOptional()
  @IsIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''], {
    message: 'Groupe sanguin invalide'
  })
  bloodType?: string;

  @IsOptional()
  @MaxLength(500, { message: 'Les allergies ne peuvent pas dépasser 500 caractères' })
  allergies?: string;

  @IsOptional()
  @MaxLength(500, { message: 'Les conditions chroniques ne peuvent pas dépasser 500 caractères' })
  chronicConditions?: string;

  @IsOptional()
  @MaxLength(500, { message: 'Les médicaments actuels ne peuvent pas dépasser 500 caractères' })
  currentMedications?: string;

  // CONTACTS D'URGENCE VRAIMENT OPTIONNELS
  @IsOptional()
  @ValidateIf((o) => o.emergencyContact && o.emergencyContact.trim() !== '')
  @MinLength(2, { message: 'Le contact d\'urgence doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le contact d\'urgence ne peut pas dépasser 100 caractères' })
  emergencyContact?: string;

  @IsOptional()
  @ValidateIf((o) => o.emergencyContactPhone && o.emergencyContactPhone.trim() !== '')
  @IsPhoneNumber('CI', { message: 'Format de téléphone du contact d\'urgence invalide' })
  emergencyContactPhone?: string;
}