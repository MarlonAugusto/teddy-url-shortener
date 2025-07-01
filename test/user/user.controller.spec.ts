import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const userServiceMock = {
      getById: jest.fn(),
    } as unknown as UserService;

    const jwtServiceMock = {
      verifyAsync: jest.fn(),
    } as unknown as JwtService;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('userInfo', () => {
    it('deve retornar os dados do usuário autenticado (happy path)', async () => {
      const req: any = { cookies: { jwt: 'valid.jwt.token' } };
      const jwtPayload = { id: 42 };
      const userData = { id: 42, name: 'Marlon', email: 'marlon@email.com' };

      jwtService.verifyAsync = jest.fn().mockResolvedValue(jwtPayload);
      userService.getById = jest.fn().mockResolvedValue(userData);

      const result = await controller.userInfo(req);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid.jwt.token');
      expect(userService.getById).toHaveBeenCalledWith(42);
      expect(result).toBe(userData);
    });

    it('deve lançar BadRequestException se o usuário não for encontrado', async () => {
      const req: any = { cookies: { jwt: 'valid.jwt.token' } };
      const jwtPayload = { id: 42 };

      // Mocka o retorno do JWT e do UserService
      jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(jwtPayload);
      jest.spyOn(userService, 'getById').mockResolvedValue(null);

      await expect(controller.userInfo(req)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.userInfo(req)).rejects.toThrow(
        'User not authenticated',
      );
    });
  });
});
