import { IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])/, {
    message:
      'Le mot de passe doit contenir au moins un chiffre et un caractère spécial',
  })
  newPassword: string;
}
