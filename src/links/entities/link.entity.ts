import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NodeSchemaDocument = HydratedDocument<LinkSchemaClass>;

@Schema({ timestamps: true, collection: 'links' })
export class LinkSchemaClass {
  @Prop()
  srcNodeName: string;

  @Prop()
  srcNode: string;

  @Prop()
  destNodeName: string;

  @Prop()
  destNode: string;

  @Prop()
  available: boolean;

  @Prop({ type: Object })
  metrics: {
    delayMs: number;
    jitterMs: number;
    bandwidthMbps: number;
    queueLength: number;
  };
}

export const LinkEntity = SchemaFactory.createForClass(LinkSchemaClass);
