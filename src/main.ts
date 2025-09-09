import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    method: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('SAGSINs APIs')
    .setDescription('The SAGSINs API description')
    .setVersion('1.0')
    .addTag('sagsins')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
