// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthResponseDto } from './dto/auth-reponse.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  /**
   * Verifică dacă user-ul există și parola e corectă
   * @param loginUserDto DTO cu username și password
   * @returns user fără password sau aruncă UnauthorizedException
   */
  async validateUser(loginUserDto: LoginUserDto) {
    const { username, password } = loginUserDto;
    const user = await this.usersService.findByUsername(username);
    if (!user)
      throw new UnauthorizedException('Invalid credentials user not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    // Returnăm user-ul fără parola
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result;
  }

  /**
   * Generează JWT token
   * @param user Obiect user validat
   */

  async login(user: UserResponseDto): Promise<AuthResponseDto> {
    // 1️⃣ Payload-ul pentru access token
    const payload = { username: user.username, sub: user.id, role: user.role };
    const access_token = this.jwtService.sign(payload);

    // 2️⃣ Generăm refresh token separat
    const refreshToken = this.jwtService.sign(
      { sub: user.id }, // payload minimal pentru refresh
      { expiresIn: '7d' }, // valabilitate lungă
    );

    // 3️⃣ Hash-uim refresh token-ul și îl salvăm în DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.setCurrentRefreshToken(user.id, hashedRefreshToken);

    // 4️⃣ Returnăm ambele token-uri
    return { access_token, refresh_token: refreshToken };
  }

  async register(registerUserDto: RegisterUserDto): Promise<UserResponseDto> {
    // 1️⃣ Hash parola
    const hashedPassword = await bcrypt.hash(registerUserDto.password, 10);

    // 2️⃣ Impunem rol default operator
    const role = 'operator';

    // 3️⃣ Creează user prin UsersService
    const user = await this.usersService.createUser({
      ...registerUserDto,
      password: hashedPassword, // parola hash-uită
      role,
    });

    // 4️⃣ Returnăm UserResponseDto (fără parola)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = user;
    return result;
  }

  async refreshTokensFromDto(dto: RefreshTokenDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const decoded = this.jwtService.decode(dto.refresh_token);
    if (!decoded || typeof decoded !== 'object' || !('sub' in decoded)) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const userId = (decoded as { sub: number }).sub;
    return this.refreshTokens(userId, dto.refresh_token);
  }

  async refreshTokens(
    userId: number,
    refreshToken: string,
  ): Promise<{ access_token: string }> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException();
    }

    return this.login({
      id: user.id,
      username: user.username,
      role: user.role,
    });
  }
  async logout(userId: number): Promise<void> {
    await this.usersService.removeRefreshToken(userId);
  }
}
