import { Module } from '@nestjs/common';
import { HeartbeatService } from './heartbeat.service';
import { HeartbeatGateway } from './heartbeat.gateway';

@Module({
  providers: [HeartbeatGateway, HeartbeatService],
  exports: [HeartbeatGateway],
})
export class HeartbeatModule {}
