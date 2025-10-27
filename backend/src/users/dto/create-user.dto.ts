// src/users/dto/create-user.dto.ts

import { IsString, MinLength, IsOptional, IsIn } from 'class-validator';

/**
 * CreateUserDto
 *
 * Scop: descrie shape-ul (schema) și regulile de validare pentru payload-ul
 * folosit la endpoint-ul POST /api/users (creare utilizator).
 *
 * Observație: DTO-urile în NestJS sunt folosite împreună cu ValidationPipe
 * din main.ts, deci orice request va fi validat automat înainte să ajungă
 * în controller/service.
 */
export class CreateUserDto {
  /**
   * username
   * - tip: string
   * - must: minim 3 caractere
   * - de ce: username-urile scurte pot fi nepractice; asigurăm format minim.
   */
  @IsString()
  @MinLength(3, { message: 'username must be at minimum 3 characters long' })
  username: string;

  /**
   * password
   * - tip: string
   * - must: minim 6 caractere (exemplu pragmatic)
   * - de ce: impunem o lungime minimă ca să evităm parole triviale.
   *         Parola va fi hash-uită în service (nu se stochează plaintext).
   */
  @IsString()
  @MinLength(6, { message: 'password must be at minimum 6 characters long' })
  password: string;

  /**
   * role (opțional la creare)
   * - tip: enum 'admin' | 'operator'
   * - de ce: vrem să permitem doar aceste valori pentru a evita erori
   *         sau privilege escalation. Daca nu e furnizat, serviciul
   *         va folosi rolul default (ex: 'operator').
   */
  @IsOptional()
  @IsIn(['admin', 'operator'], {
    message: 'role must be admin or operator',
  })
  role?: 'admin' | 'operator';

  /**
   * fullName (opțional)
   * - tip: string
   * - de ce: câmp cosmetic pentru afișare în UI; nu este necesar la autentificare.
   */
  @IsOptional()
  @IsString()
  fullName?: string;
}
