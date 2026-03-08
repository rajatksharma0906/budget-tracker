import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3001;

  const config = new DocumentBuilder()
    .setTitle('Budget Tracker API')
    .setVersion('1.0')
    .addApiKey({ type: 'apiKey', name: 'X-User-Id', in: 'header' }, 'X-User-Id')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Use CDN for Swagger UI assets so they load in prod (avoids 404 on bundled files)
  const swaggerCdn = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0';
  SwaggerModule.setup('api-docs', app, document, {
    customCssUrl: [`${swaggerCdn}/swagger-ui.css`],
    customJs: [
      `${swaggerCdn}/swagger-ui-bundle.js`,
      `${swaggerCdn}/swagger-ui-standalone-preset.js`,
    ],
  });

  await app.listen(port, process.env.HOSTNAME || '0.0.0.0');
  console.log(`> Budget Tracker API ready on port ${port}`);
  console.log(`> Swagger UI: http://localhost:${port}/api-docs`);
}

bootstrap();
