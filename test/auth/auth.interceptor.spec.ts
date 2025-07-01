import { JwtService } from '@nestjs/jwt';
import { AuthInterceptor } from '../../src/auth/auth.interceptor';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('AuthInterceptor', () => {
  let jwtService: jest.Mocked<JwtService>;
  let authInterceptor: AuthInterceptor;

  beforeEach(() => {
    jwtService = {
      verify: jest.fn(),
    } as any;

    authInterceptor = new AuthInterceptor(jwtService);
  });

  it('deve permitir a requisição se o JWT for válido', async () => {
    jwtService.verify = jest.fn().mockReturnValue(true);

    const mockValidToken = {
      switchToHttp: () => ({
        getRequest: () => ({ cookies: { jwt: 'valid-token' } }),
      }),
    } as ExecutionContext;
    const mockNext = { handle: jest.fn().mockReturnValue('next-called') };

    const result = await authInterceptor.intercept(mockValidToken, mockNext);

    expect(mockNext.handle).toHaveBeenCalled();
    expect(result).toBe('next-called');
    expect(jwtService.verify).toHaveBeenCalledWith('valid-token');
  });

  it('deve lançar UnauthorizedException se o JWT for inválido', () => {
    // Arrange
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: { jwt: 'invalid-token' },
        }),
      }),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn(),
    };

    // Força o verify a lançar erro
    (jwtService.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    // Act & Assert
    expect(() => authInterceptor.intercept(context, next)).toThrow(
      UnauthorizedException,
    );
  });
});
