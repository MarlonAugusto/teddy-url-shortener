import { Controller, Get, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthInterceptor } from 'src/auth/auth.interceptor';
import { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('user')
export class UserController {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) { }

    @UseInterceptors(AuthInterceptor)
    @Get('info')
    async userInfo(@Req() req: Request) {
        const cookie = req.cookies['jwt'];
        const data = await this.jwtService.verifyAsync(cookie);

        const user = await this.userService.getById(data['id']);

        if (!user) return null;

        return user;
    }
}
