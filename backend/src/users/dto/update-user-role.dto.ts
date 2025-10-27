// src/users/dto/update-user-role.dto.ts
import { IsIn } from 'class-validator';

export class UpdateUserRoleDto {
  @IsIn(['admin', 'operator'], {
    message: 'Role must be either admin or operator',
  })
  role: 'admin' | 'operator';
}
