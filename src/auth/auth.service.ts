import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/models/user.entity';
import { User } from '../user/models/user.interface';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private userService: UserService,
  ) {}

  async createUser(user: User): Promise<User> {
    if (!user.name || !user.email || !user.password)
      throw new BadRequestException('Name, Email and Password are required.');

    const userEmail = await this.userService.getByEmail(user.email);
    if (userEmail) throw new BadRequestException('Email already registered.');

    user.password = await bcrypt.hash(user.password, 12);

    const savedUser = await this.userRepository.save(user);

    return {
      id: savedUser.id,
      name: savedUser.name,
      email: savedUser.email,
    };
  }

  async login(email: string, password: string) {
    const user = await this.userService.getByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid credentials');
    }

    return { id: user.id, name: user.name, email: user.email };
  }
}
