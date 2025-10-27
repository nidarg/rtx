import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  Patch,
  UseGuards,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Controller('users') // ruta de bază: /users
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  // Injectăm serviciul UsersService, ca să folosim logica de creare și listare useri

  /**
   * GET /users
   * Returnează lista tuturor userilor
   */
  @Get()
  async findAll() {
    return this.usersService.findAll();
    // pur și simplu apelăm metoda service, care returnează toate înregistrările din DB
  }

  /**
   * POST /users
   * Creează un user nou folosind DTO-ul validat
   */
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      // apelăm serviciul pentru creare user
      const user = await this.usersService.createUser(createUserDto);

      // eliminăm parola din răspuns pentru securitate
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...safeUser } = user as CreateUserDto;
      return safeUser;
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new BadRequestException(err.message);
      }
      throw new BadRequestException('Unable to create user');
    }
  }
  // PATCH /users/:id/role
  @Patch(':id/role')
  @UseGuards(JwtAuthGuard, RolesGuard) // 1. JWT guard + 2. Role guard
  @Roles('admin') // doar admin poate schimba rolul
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateUserRoleDto,
  ) {
    return await this.usersService.updateUserRole(+id, updateRoleDto.role);
  }
  // DELETE /api/users/:id
  @UseGuards(JwtAuthGuard, RolesGuard) // 1. AuthGuard checks JWT, RolesGuard checks role
  @Roles('admin') // 2. Only admin users can access this route
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    // Calls service to delete user
    return await this.usersService.deleteUser(+id); // convert id to number
  }
}
