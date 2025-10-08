import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { NodeStatus } from '../domain/node-status.vo';

export type NodeSchemaDocument = HydratedDocument<NodeSchemaClass>;

@Schema({ timestamps: true, collection: 'nodes' })
export class NodeSchemaClass {
  @Prop()
  name: string;

  @Prop({ enum: NodeStatus, default: NodeStatus.DOWN })
  status: NodeStatus;

  @Prop() hostname: string;

  @Prop() ip: string;

  @Prop({ enum: ['drone', 'ship', 'ground_station', 'mobile_device', 'satellite'], required: true })
  type: 'drone' | 'ship' | 'ground_station' | 'mobile_device' | 'satellite';

  @Prop({ type: Object })
  metrics: {
    cpuLoad: number;
    jitterMs: number;
    queueLen: number;
    throughputMbps: number;
  };
}

export const NodeEntity = SchemaFactory.createForClass(NodeSchemaClass);
