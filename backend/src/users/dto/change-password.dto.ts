import {
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';

/**
 * DTO pour le changement de mot de passe
 * Validation alignée sur RegisterDto (simple et cohérente)
 * Nécessite l'ancien mot de passe pour sécurité
 */
export class ChangePasswordDto {
  @IsNotEmpty({ message: 'L\'ancien mot de passe est obligatoire' })
  oldPassword: string;

  @IsNotEmpty({ message: 'Le nouveau mot de passe est obligatoire' })
  @MinLength(3, { message: 'Le nouveau mot de passe doit contenir au moins 3 caractères' })
  @MaxLength(50, { message: 'Le nouveau mot de passe ne peut pas dépasser 50 caractères' })
  @Matches(
    /^[a-zA-Z0-9]+$/,
    {
      message: 'Le nouveau mot de passe ne peut contenir que des lettres et des chiffres'
    }
  )
  newPassword: string;

  @IsNotEmpty({ message: 'La confirmation du mot de passe est obligatoire' })
  confirmPassword: string;
}