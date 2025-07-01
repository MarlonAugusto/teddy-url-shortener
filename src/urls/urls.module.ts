import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from './models/url.entity';
import { UserEntity } from 'src/user/models/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UrlsService } from './urls.service';
import { UrlsController } from './urls.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity, UserEntity]), AuthModule],
  controllers: [UrlsController],
  providers: [UrlsService],
  exports: [UrlsService],
})
export class UrlsModule {}
