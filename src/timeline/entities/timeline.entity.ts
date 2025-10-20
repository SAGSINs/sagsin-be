import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TimelineStatus } from '../domain/timeline-status.vo';

export type TimelineSchemaDocument = HydratedDocument<TimelineSchemaClass>;

@Schema({ timestamps: true, collection: 'timelines' })
export class TimelineSchemaClass {
    @Prop({ type: String })
    _id: string;

    @Prop({
        type: [{
            hostname: String,
            timestamp: Date,
            status: {
                type: String,
                enum: TimelineStatus,
                default: TimelineStatus.PENDING
            }
        }]
    })
    timeline: Array<{
        hostname: string;
        timestamp: Date;
        status: TimelineStatus;
    }>;
}

export const TimelineEntity = SchemaFactory.createForClass(TimelineSchemaClass);
