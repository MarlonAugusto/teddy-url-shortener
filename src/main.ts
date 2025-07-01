import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser'
import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.setGlobalPrefix('api', {
    exclude: ['/:shortUrl'],
  });

  //const swaggerDocument = yaml.load(readFileSync(resolve(__dirname, '../api-spec.yaml'), 'utf8'));
  //SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.API_PORT ?? 8000);
  console.log(`Projeto URL: http://localhost:${process.env.API_PORT}`)
  console.log(`Swagger URL: http://localhost:${process.env.API_PORT}/docs`)

}
bootstrap();
