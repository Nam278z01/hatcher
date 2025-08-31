import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createNestPinoLogger } from '@workspace/logger';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const level = configService.get<string>('LOG_LEVEL');
  const logger = createNestPinoLogger('api', level ? { level: level as any } : {});
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
