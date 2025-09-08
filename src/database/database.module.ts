import { Module } from '@nestjs/common';
import { MongooseConfigService } from './mongoose.config';

@Module({
  providers: [MongooseConfigService],
  exports: [MongooseConfigService],
})
export class DatabaseModule {}
