import { Module } from '@nestjs/common';
import { LinksService } from './links.service';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { LinkSchemaClass, LinkEntity } from './entities/link.entity';
import { attachLinkHooks } from './repository/attach-link.hook';
import { HeartbeatModule } from 'src/heartbeat/heartbeat.module';
import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';
import { Connection } from 'mongoose';

@Module({
  providers: [LinksService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: LinkSchemaClass.name,
        imports: [HeartbeatModule],
        inject: [HeartbeatGateway, getConnectionToken()],
        useFactory: (gateway: HeartbeatGateway, connection: Connection) => {
          const schema = LinkEntity;
          attachLinkHooks(schema, connection, gateway, LinkSchemaClass.name);
          return schema;
        },
      },
    ]),
    HeartbeatModule,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: LinkSchemaClass.name, schema: LinkEntity },
    ]),
    LinksService,
  ],
})
export class LinksModule {}
