import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';
import * as _ from 'lodash';

const HEARTBEAT_TIMEOUT_MS = 20000;
const MISSED_LIMIT = 3;
@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(NodeSchemaClass.name) private model: Model<NodeSchemaClass>,
  ) { }

  private missedCount = new Map<string, number>();

  async updateNode(payload: { ip: string; hostname: string, metrics: any, lat: number, lng: number }) {
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

    this.missedCount.set(ip, 0);
    if (this.timers.has(ip)) clearTimeout(this.timers.get(ip)!);

    this.timers.set(ip, setTimeout(async () => {
      const missed = (this.missedCount.get(ip) ?? 0) + 1;
      if (missed < MISSED_LIMIT) {
        this.missedCount.set(ip, missed);
        return;
      }

      this.logger.warn(`Node ${hostname} timed out -> DOWN`);
      await this.model.updateOne({ ip }, { $set: { status: NodeStatus.DOWN } });
    }, HEARTBEAT_TIMEOUT_MS));
  }
}
