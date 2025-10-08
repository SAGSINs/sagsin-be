import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  const config = new DocumentBuilder()
    .setTitle('SAGSINs APIs')
    .setDescription('The SAGSINs API description')
    .setVersion('1.0')
    .addTag('sagsins')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const grpcOptions: MicroserviceOptions = {
    transport: Transport.GRPC,
    options: {
      package: process.env.GRPC_PACKAGE ?? 'monitor',
      protoPath: process.env.GRPC_PROTO_PATH
        ? join(process.cwd(), process.env.GRPC_PROTO_PATH)
        : join(__dirname, '../proto/monitor.proto').toString(),
      url: process.env.GRPC_URL ?? '0.0.0.0:50051',

      loader: {
        keepCase: false,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      },
    },
  };

  app.connectMicroservice(grpcOptions);
  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
