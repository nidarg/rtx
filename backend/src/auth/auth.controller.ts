// src/auth/auth.controller.ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    // trimite DTO direct la service
    const user = await this.authService.validateUser(loginUserDto);
    return this.authService.login(user);
  }
  // =========================
  // REGISTER
  // =========================
  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto,
  ): Promise<UserResponseDto> {
    // Trimite DTO-ul către AuthService
    // AuthService va hash-ui parola, impune rolul operator și va crea user-ul
    return this.authService.register(registerUserDto);
  }
  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshTokensFromDto(dto);
  }
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request) {
    const user = req.user as { id: number };
    await this.authService.logout(user.id);
    return { message: 'Logged out successfully' };
  }
}
