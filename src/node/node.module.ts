// node.module.ts
import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { NodeSchemaClass, NodeEntity } from './entities/node.entity';
import { attachNodeHooks } from './repository/attach-node.hook';
import { HeartbeatModule } from 'src/heartbeat/heartbeat.module';
import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';
import { Connection } from 'mongoose';

@Module({
  controllers: [NodeController],
  providers: [NodeService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: NodeSchemaClass.name,
        imports: [HeartbeatModule],
        inject: [HeartbeatGateway, getConnectionToken()],
        useFactory: (gateway: HeartbeatGateway, connection: Connection) => {
          const schema = NodeEntity;
          attachNodeHooks(schema, connection, gateway, NodeSchemaClass.name);
          return schema;
        },
      },
    ]),
    HeartbeatModule,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeEntity },
    ]),
  ],
})
export class NodeModule { }
