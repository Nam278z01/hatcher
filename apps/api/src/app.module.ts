import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ApiEnvSchema } from './config/env';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: (() => {
        const env = process.env.NODE_ENV ?? 'development'
        return [
          // App-local env files (monorepo)
          `apps/api/.env.${env}.local`,
          `apps/api/.env.${env}`,
          'apps/api/.env.local',
          'apps/api/.env',
          // Root-level fallbacks
          `.env.${env}.local`,
          `.env.${env}`,
          '.env.local',
          '.env',
        ]
      })(),
      validate: (cfg) => ApiEnvSchema.parse(cfg),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
