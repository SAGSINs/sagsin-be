import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';
import * as _ from 'lodash';

@Injectable()
export class NodeService {

  constructor(
    @InjectModel(NodeSchemaClass.name) private model: Model<NodeSchemaClass>,
  ) { }

  async updateNode(payload: {
    ip: string;
    hostname: string;
    metrics: any;
    lat: number;
    lng: number;
  }) {
    const { ip, hostname, metrics, lat, lng } = payload;

    await this.model.findOneAndUpdate(
      { ip },
      {
        $set: {
          name: _.startCase(hostname),
          ip,
          hostname,
          status: NodeStatus.UP,
          metrics,
          type: hostname.split('_')[0] || 'unknown',
          lat,
          lng,
        },
      },
      { upsert: true },
    );
  }
}
