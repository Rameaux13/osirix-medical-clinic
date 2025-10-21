import { 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  MaxLength 
} from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est obligatoire' })
  @MaxLength(100, { message: 'L\'email ne peut pas dépasser 100 caractères' })
  email: string;

  @IsNotEmpty({ message: 'Le mot de passe est obligatoire' })
  @MinLength(1, { message: 'Le mot de passe est requis' })
  @MaxLength(50, { message: 'Le mot de passe ne peut pas dépasser 50 caractères' })
  password: string;
}