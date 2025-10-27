import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  async findById(id: number) {
    return await this.userRepo.findOne({
      where: { id },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { username, password, role } = createUserDto;

    // Verificăm duplicate
    const existing = await this.userRepo.findOne({ where: { username } });
    if (existing) throw new BadRequestException('Username already exists');

    // Cream entity cu parola exact cum vine (hash-uită deja)
    const user = this.userRepo.create({
      username,
      password,
      role: role ?? 'operator',
      fullName: createUserDto.fullName,
    });

    return this.userRepo.save(user);
  }

  async updateUserRole(userId: number, newRole: 'admin' | 'operator') {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.role = newRole;
    return this.userRepo.save(user); // salvează modificarea
  }
  // Deletes a user by id
  async deleteUser(id: number): Promise<{ message: string }> {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);

    await this.userRepo.delete(id);
    return { message: `User with id ${id} successfully deleted` };
  }
  async setCurrentRefreshToken(userId: number, refreshToken: string) {
    await this.userRepo.update(userId, { refreshToken });
  }
  async removeRefreshToken(userId: number): Promise<void> {
    await this.userRepo.update(userId, { refreshToken: null });
  }
}
