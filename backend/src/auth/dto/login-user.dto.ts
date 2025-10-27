// src/auth/dto/login-user.dto.ts
import { IsString, MinLength } from 'class-validator';

/**
 * LoginUserDto
 *
 * Shape-ul payload-ului de login
 */
export class LoginUserDto {
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
