import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createNestPinoLogger } from './logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ApiEnv } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const env =
    configService.get<ApiEnv["NODE_ENV"]>('NODE_ENV') ?? 'development' as ApiEnv["NODE_ENV"];
  const level = configService.get<ApiEnv["LOG_LEVEL"]>('LOG_LEVEL');
  const logger = createNestPinoLogger(
    'api',
    level ? { env, level: level } : { env },
  );
  app.useLogger(logger);

  if (configService.get<boolean>('SWAGGER', { infer: true })) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('API')
      .setDescription('API documentation')
      .setVersion('1.0.0')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document);
  }

  const port = configService.get<number>('PORT', { infer: true }) ?? 3000;

  await app.listen(port);
  logger.log(`API server is running on http://localhost:${port}`);
}
bootstrap();
