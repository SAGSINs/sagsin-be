import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimelineSchemaClass } from './entities/timeline.entity';
import { TimelineStatus } from './domain/timeline-status.vo';

@Injectable()
export class TimelineService {
  private readonly logger = new Logger(TimelineService.name);

  constructor(
    @InjectModel(TimelineSchemaClass.name)
    private model: Model<TimelineSchemaClass>,
  ) {}
  async addTimelineUpdate(
    transferId: string,
    hostname: string,
    timestamp: string,
    status: 'DONE' | 'PENDING',
  ) {
    try {
      const timelineEntry = {
        hostname,
        timestamp: new Date(timestamp),
        status:
          status === 'DONE' ? TimelineStatus.DONE : TimelineStatus.PENDING,
      };

      const result = await this.model.findOneAndUpdate(
        { _id: transferId },
        {
          $push: {
            timeline: timelineEntry,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );

      this.logger.log(`Updated: ${transferId} @ ${hostname} → ${status}`);
      return result;
    } catch (error) {
      this.logger.error(`Error updating timeline: ${error.message}`);
      throw error;
    }
  }

  async getTimeline(transferId: string) {
    return this.model.findById(transferId);
  }

  async getAllTimelines() {
    return this.model.find().sort({ updatedAt: -1 });
  }
}
