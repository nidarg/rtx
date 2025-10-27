// src/auth/dto/register-user.dto.ts
import { IsString, MinLength, IsOptional } from 'class-validator';

/**
 * RegisterUserDto
 *
 * Folosit pentru endpoint-ul public POST /auth/register
 * - Nu permite setarea rolului de către client (toți userii devin 'operator')
 */
export class RegisterUserDto {
  /**
   * username
   * - obligatoriu
   * - minim 3 caractere
   */
  @IsString()
  @MinLength(3, { message: 'Username must be at least 3 characters long' })
  username: string;

  /**
   * password
   * - obligatoriu
   * - minim 6 caractere
   * - va fi hash-uit înainte de a fi salvat în DB
   */
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  /**
   * fullName (opțional)
   * - pentru afișare în UI
   */
  @IsOptional()
  @IsString()
  fullName?: string;
}
