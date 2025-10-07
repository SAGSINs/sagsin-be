import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';
import * as _ from 'lodash';

const HEARTBEAT_TIMEOUT_MS = 20000;

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(NodeSchemaClass.name) private model: Model<NodeSchemaClass>,
  ) { }

  async updateNode(payload: { ip: string; hostname: string }) {
    const { ip, hostname } = payload;

    await this.model.findOneAndUpdate(
      { ip },
      {
        $set: {
          name: _.startCase(hostname),
          ip,
          hostname,
          status: NodeStatus.UP,
        },
      },
      { upsert: true },
    );

    if (this.timers.has(ip)) clearTimeout(this.timers.get(ip)!);
    this.timers.set(
      ip,
      setTimeout(async () => {
        this.logger.warn(`Node ${hostname} timed out -> DOWN`);
        await this.model.updateOne(
          { ip },
          { $set: { status: NodeStatus.DOWN } },
        );
      }, HEARTBEAT_TIMEOUT_MS),
    );
  }
}
