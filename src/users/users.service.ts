import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  /**
   * UsersService
   *
   * Aici punem întreaga logică legată de utilizatori:
   * - creare user cu hash la parola
   * - căutare user după username
   * - listare useri
   *
   * Observație:
   * Serviciul nu știe HTTP; doar expune metode pentru module/controller.
   */

  async findAll() {
    return await this.userRepo.find();
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepo.findOne({ where: { username } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, role } = createUserDto;

    // Verificăm duplicate
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new BadRequestException('Username already exists');

    // Hash parola
    // eslint-disable-next-line prettier/prettier, @typescript-eslint/no-unsafe-member-access
    const hashedPassword = (await bcrypt.hash(password, 10)) as string;

    // Cream entity
    const user = this.userRepo.create({
      username,
      password: hashedPassword,
      role: role ?? 'operator',
      fullName: createUserDto.fullName,
    });

    return this.userRepo.save(user);
  }
}
