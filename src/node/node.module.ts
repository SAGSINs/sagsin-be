import { Module } from '@nestjs/common';
import { NodeService } from './node.service';
import { NodeController } from './node.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeSchemaClass, NodeEntity } from './entities/node.entity';

@Module({
  controllers: [NodeController],
  providers: [NodeService],
  imports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeEntity },
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeEntity },
    ]),
  ],
})
export class NodeModule {}
