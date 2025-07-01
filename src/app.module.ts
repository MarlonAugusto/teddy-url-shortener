import { Module } from '@nestjs/common';
import { UrlsModule } from './urls/urls.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RedirectModule } from './redirect/redirect.module';

@Module({
  imports: [UrlsModule, DatabaseModule, AuthModule, UserModule, RedirectModule],
})
export class AppModule {}
