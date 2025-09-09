import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NodeStatus } from '../domain/node-status.vo';

export type NodeSchemaDocument = HydratedDocument<NodeSchemaClass>;

@Schema({ timestamps: true, collection: 'nodes' })
export class NodeSchemaClass {
  @Prop({ required: true, unique: true })
  nodeId: string;

  @Prop({ type: Date, required: false })
  lastSeenAt?: Date;

  @Prop({ enum: NodeStatus, default: NodeStatus.DOWN })
  status: NodeStatus;

  @Prop() ip: string;

  @Prop() hostName: string;
}

export const NodeEntity = SchemaFactory.createForClass(NodeSchemaClass);
