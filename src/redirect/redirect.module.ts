import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlEntity } from '../urls/models/url.entity';
import { RedirectController } from './redirect.controller';
import { RedirectService } from './redirect.service';
import { UrlsModule } from '../urls/urls.module';

@Module({
  imports: [TypeOrmModule.forFeature([UrlEntity]), UrlsModule],
  controllers: [RedirectController],
  providers: [RedirectService],
  exports: [RedirectService],
})
export class RedirectModule {}
