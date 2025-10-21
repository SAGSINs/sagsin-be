import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeSchemaClass, NodeEntity } from './entities/node.entity';
import { attachNodeHooks } from './repository/attach-node.hook';
import { HeartbeatModule } from 'src/heartbeat/heartbeat.module';
import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';
import { LinksModule } from 'src/links/links.module';

@Module({
  controllers: [NodeController],
  providers: [NodeService],
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: NodeSchemaClass.name,
        imports: [HeartbeatModule],
        inject: [HeartbeatGateway],
        useFactory: (gateway: HeartbeatGateway) => {
          const schema = NodeEntity;
          attachNodeHooks(schema, gateway);
          return schema;
        },
      },
    ]),
    HeartbeatModule,
    LinksModule,
  ],
  exports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeEntity },
    ]),
  ],
})
export class NodeModule {}
