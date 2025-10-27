// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserResponseDto } from '../dto/user-response.dto'; // tipul user-ului

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1️⃣ Citim rolurile permise din metadata
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true; // dacă nu e metadata, allow by default

    // 2️⃣ Obținem request-ul HTTP
    const request = context
      .switchToHttp()
      .getRequest<{ user: UserResponseDto }>();

    // 3️⃣ User-ul logat (populat de JwtAuthGuard)
    const user = request.user;

    // 4️⃣ Verificăm dacă rolul user-ului este permis
    return requiredRoles.includes(user.role);
  }
}
