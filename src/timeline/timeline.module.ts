import { Module, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TimelineService } from './timeline.service';
import { TimelineController } from './timeline.controller';
import {
  TimelineSchemaClass,
  TimelineEntity,
} from './entities/timeline.entity';
import { attachTimelineHooks } from './repository/attach-timeline.hook';
import { TimelineGrpcServer } from './grpc/timeline-grpc.server';
import { HeartbeatModule } from 'src/heartbeat/heartbeat.module';
import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: TimelineSchemaClass.name,
        imports: [HeartbeatModule],
        inject: [HeartbeatGateway],
        useFactory: (gateway: HeartbeatGateway) => {
          const schema = TimelineEntity;
          attachTimelineHooks(schema, gateway);
          return schema;
        },
      },
    ]),
    HeartbeatModule,
  ],
  controllers: [TimelineController],
  providers: [TimelineService],
  exports: [
    MongooseModule.forFeature([
      { name: TimelineSchemaClass.name, schema: TimelineEntity },
    ]),
    TimelineService,
  ],
})
export class TimelineModule implements OnModuleInit, OnModuleDestroy {
  private grpcServer: TimelineGrpcServer;

  constructor(private readonly timelineService: TimelineService) {}

  async onModuleInit() {
    const port = process.env.TIMELINE_GRPC_PORT || '0.0.0.0:50053';

    this.grpcServer = new TimelineGrpcServer(this.timelineService, port);

    try {
      await this.grpcServer.start();
    } catch (error) {
      console.error('[TimelineModule] ❌ Failed to start gRPC server:', error);
      console.error('[TimelineModule] Error details:', error.message);
      console.error('[TimelineModule] Stack:', error.stack);
    }
  }
  async onModuleDestroy() {
    if (this.grpcServer) {
      await this.grpcServer.stop();
    }
  }
}
