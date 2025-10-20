import { Controller, Get, Param } from '@nestjs/common';
import { TimelineService } from './timeline.service';

@Controller('timeline')
export class TimelineController {
  constructor(private readonly timelineService: TimelineService) { }

  /**
   * Get all timelines
   * GET /timeline
   */
  @Get()
  async getAllTimelines() {
    return this.timelineService.getAllTimelines();
  }

  /**
   * Get specific timeline by transfer ID
   * GET /timeline/:id
   */
  @Get(':id')
  async getTimeline(@Param('id') id: string) {
    return this.timelineService.getTimeline(id);
  }
}
