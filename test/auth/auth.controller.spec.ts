import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../src/auth/auth.controller';
import { AuthService } from '../../src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import { RegisterDTO } from '../../src/auth/dto/register.dto';
import { Response } from 'express';
import * as request from 'supertest';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let jwtService: JwtService;

  jest.mock('src/urls/models/url.entity', () => ({
    UrlEntity: class {},
  }));


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            createUser: jest.fn(),
            login: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('register', () => {
    it('deve registrar um usuário com sucesso quando as senhas coincidem', async () => {
      const registerDTO: RegisterDTO = {
        name: 'teste',
        email: 'test@example.com',
        password: 'password',
        password_confirm: 'password',
      };

      jest
        .spyOn(authService, 'createUser')
        .mockResolvedValue({ id: 1, email: 'test@example.com' });

      const result = await controller.register(registerDTO);

      expect(result).toEqual({ id: 1, email: 'test@example.com' });
      expect(authService.createUser).toHaveBeenCalledWith(registerDTO);
    });

    it('deve lançar BadRequestException quando as senhas não coincidem', async () => {
      const registerDTO: RegisterDTO = {
        name: 'teste',
        email: 'test@example.com',
        password: 'password',
        password_confirm: 'different_password',
      };

      await expect(controller.register(registerDTO)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.createUser).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException quando ocorre um erro no serviço', async () => {
      const registerDTO: RegisterDTO = {
        name: 'teste',
        email: 'test@example.com',
        password: 'password',
        password_confirm: 'password',
      };

      jest
        .spyOn(authService, 'createUser')
        .mockRejectedValue(new Error('Erro no serviço'));

      await expect(controller.register(registerDTO)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.createUser).toHaveBeenCalledWith(registerDTO);
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso e definir o cookie JWT', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = { id: 1, name: 'teste', email: 'test@example.com' };
      const jwt = 'jwt-token';

      jest.spyOn(authService, 'login').mockResolvedValue(user);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValue(jwt);

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.login(email, password, res);

      expect(result).toEqual({ message: 'Login successful', user });
      expect(authService.login).toHaveBeenCalledWith(email, password);
      expect(jwtService.signAsync).toHaveBeenCalledWith({ id: user.id });
      expect(res.cookie).toHaveBeenCalledWith('jwt', jwt, { httpOnly: true });
    });

    it('deve lançar BadRequestException quando ocorre um erro no serviço', async () => {
      const email = 'test@example.com';
      const password = 'password';

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(new Error('Erro no serviço'));

      const res = {
        cookie: jest.fn(),
      } as unknown as Response;

      await expect(controller.login(email, password, res)).rejects.toThrow(
        BadRequestException,
      );
      expect(authService.login).toHaveBeenCalledWith(email, password);
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso e remover o cookie JWT', async () => {
      const res = {
        clearCookie: jest.fn(),
      } as unknown as Response;

      const result = await controller.logout(res);

      expect(result).toEqual({ message: 'Logged out with success' });
      expect(res.clearCookie).toHaveBeenCalledWith('jwt');
    });

  });
});
