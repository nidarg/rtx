// src/auth/dto/user-response.dto.ts
export class UserResponseDto {
  id: number;
  username: string;
  role: 'admin' | 'operator';
}
