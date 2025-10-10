import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './database/config/database.config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseConfigService } from './database/mongoose.config';
import { ThrottlerModule } from '@nestjs/throttler';
import { NodeModule } from './node/node.module';
import { HeartbeatModule } from './heartbeat/heartbeat.module';
import { LinksModule } from './links/links.module';
import { HeuristicModule } from './heuristic/heuristic.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: ['.env'],
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60,
          limit: 100,
        },
      ],
    }),
    MongooseModule.forRootAsync({
      useClass: MongooseConfigService,
    }),
    NodeModule,
    HeartbeatModule,
    LinksModule,
    HeuristicModule,
    ScheduleModule.forRoot()
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
