import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../src/auth/auth.service';
import { UserService } from '../../src/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../../src/user/models/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let userService: UserService;
  let userRepository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            getByEmail: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  const password = '123';
  const hashedPassword =
    '$2b$12$JELuiNBXs4/C8iMQeNow3ORAVfDOamfKYhYg2mfREb2g9sonu6r5e';
  describe('createUser', () => {
    it('deve criar um usuário com sucesso quando todos os campos obrigatórios são fornecidos e o e-mail não está registrado', async () => {
      const user = {
        name: 'teste',
        email: 'test@example.com',
        password: password,
        confirm_password: password,
      };

      userService.getByEmail = jest.fn().mockResolvedValue(null);
      userRepository.save = jest.fn().mockResolvedValue({ id: 1, ...user });

      const result = await service.createUser(user);

      expect(result).toEqual({
        id: 1,
        name: 'teste',
        email: 'test@example.com',
      });
      expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando algum campo obrigatório está faltando', async () => {
      const user = {
        name: 'teste',
        email: '',
        password: password,
      };

      await expect(service.createUser(user)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar BadRequestException quando o e-mail já está registrado', async () => {
      const user = {
        name: 'teste',
        email: 'test@example.com',
        password: password,
      };

      userService.getByEmail = jest.fn().mockResolvedValue({ id: 1, ...user });

      await expect(service.createUser(user)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso quando o e-mail e a senha estão corretos', async () => {
      const user = {
        id: 1,
        name: 'teste',
        email: 'test@example.com',
        password: hashedPassword,
      };

      userService.getByEmail = jest.fn().mockResolvedValue(user);

      const result = await service.login('test@example.com', password);

      expect(result).toEqual({
        id: 1,
        name: 'teste',
        email: 'test@example.com',
      });
      expect(userService.getByEmail).toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando o e-mail não existe', async () => {
      jest.spyOn(userService, 'getByEmail').mockResolvedValue(null);

      await expect(
        service.login('test@example.com', 'password'),
      ).rejects.toThrow(BadRequestException);
      expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('deve lançar BadRequestException quando a senha está incorreta', async () => {
      const wrongPassword = '444';
      const user = {
        id: 1,
        name: 'teste',
        email: 'test@example.com',
        password: hashedPassword,
      };

      userService.getByEmail = jest.fn().mockResolvedValue(user);
      bcrypt.compare(wrongPassword, hashedPassword);

      await expect(
        service.login('test@example.com', 'wrongPassword'),
      ).rejects.toThrow(BadRequestException);
      expect(userService.getByEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
});
