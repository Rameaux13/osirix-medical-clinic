// src/auth/dto/reset-password.dto.ts

import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString({ message: 'Le token doit être une chaîne de caractères' })
  @IsNotEmpty({ message: 'Le token est requis' })
  token: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Le nouveau mot de passe est requis' })
  newPassword: string;
}