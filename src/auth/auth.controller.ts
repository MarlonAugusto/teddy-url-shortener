import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AuthInterceptor } from './auth.interceptor';
import { RegisterDTO } from './dto/register.dto';

export interface AuthResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

@UseInterceptors(ClassSerializerInterceptor)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: RegisterDTO): Promise<AuthResponse> {
    try {
      if (body.password !== body.password_confirm) {
        throw new BadRequestException('Passwords does not match');
      }
      const user = await this.authService.createUser(body);
      return {
        status: 'success',
        message: 'User registered successfully',
        data: user,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    try {
      const user = await this.authService.login(email, password);
      const jwt = await this.jwtService.signAsync({ id: user.id });
      res.cookie('jwt', jwt, { httpOnly: true });

      return { message: 'Login successful', user };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @UseInterceptors(AuthInterceptor)
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');

    return { message: 'Logged out with success' };
  }
}
