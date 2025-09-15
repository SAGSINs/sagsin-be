import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NodeStatus } from '../domain/node-status.vo';

export type NodeSchemaDocument = HydratedDocument<NodeSchemaClass>;

@Schema({ timestamps: true, collection: 'nodes' })
export class NodeSchemaClass {
  @Prop({ enum: NodeStatus, default: NodeStatus.DOWN })
  status: NodeStatus;

  @Prop() hostname: string;

  @Prop() ip: string;
}

export const NodeEntity = SchemaFactory.createForClass(NodeSchemaClass);
