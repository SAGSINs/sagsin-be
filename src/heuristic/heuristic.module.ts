import { Module } from '@nestjs/common';
import { HeuristicService } from './heuristic.service';
import { MongooseModule } from '@nestjs/mongoose';
import { NodeEntity, NodeSchemaClass } from 'src/node/entities/node.entity';
import { LinkEntity, LinkSchemaClass } from 'src/links/entities/link.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NodeSchemaClass.name, schema: NodeEntity },
      { name: LinkSchemaClass.name, schema: LinkEntity },
    ]),
  ],
  providers: [HeuristicService],
})
export class HeuristicModule { }
