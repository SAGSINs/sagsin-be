import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import * as mongooseAutoPopulate from 'mongoose-autopopulate';
import { AllConfigType } from 'src/config/config.type';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get('database.url', { infer: true }),
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate);
        return connection;
      },
    };
  }
}
