import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from '../../src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: JwtService,
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('deve retornar true se o token JWT não for fornecido', async () => {
    const mockRequest = {
      cookies: {},
    } as Request;

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('deve retornar true e adicionar usuário à requisição se o token JWT for válido', async () => {
    const mockUser = { userId: 1, username: 'testuser' };
    const mockRequest = {
      cookies: { jwt: 'valid-token' },
      user: null,
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    jest.spyOn(jwtService, 'verifyAsync').mockResolvedValue(mockUser);

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid-token');
    expect(mockRequest.user).toEqual(mockUser);
  });

  it('deve retornar true se o token JWT for inválido', async () => {
    const mockRequest = {
      cookies: { jwt: 'invalid-token' },
    };

    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    jest
      .spyOn(jwtService, 'verifyAsync')
      .mockRejectedValue(new Error('Invalid token'));

    const result = await guard.canActivate(mockContext);

    expect(result).toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('invalid-token');
  });
});
