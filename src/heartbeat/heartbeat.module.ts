import { Module } from '@nestjs/common';
import { HeartbeatGateway } from './heartbeat.gateway';

@Module({
  providers: [HeartbeatGateway],
  exports: [HeartbeatGateway],
})
export class HeartbeatModule { }
