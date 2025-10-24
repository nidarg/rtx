import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

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
}
