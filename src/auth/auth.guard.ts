import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const cookie = request.cookies?.jwt;

    if (!cookie) {
      return true;
    }

    try {
      const data = await this.jwtService.verifyAsync(cookie);
      request.user = data;

      return true;
    } catch {
      return true;
    }

  }
}
