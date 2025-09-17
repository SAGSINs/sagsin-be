import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';

const HEARTBEAT_TIMEOUT_MS = 20000;

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(NodeSchemaClass.name) private model: Model<NodeSchemaClass>,
  ) { }

  async upsertBeat(payload: {
    ip: string;
    hostname: string;
    links?: any[];
  }) {
    const { ip, hostname, links = [] } = payload;

    await this.model.findOneAndUpdate(
      { ip },
      {
        $set: {
          ip,
          hostname,
          status: NodeStatus.UP,
          links,
        },
      },
      { upsert: true },
    );

    // reset watchdog
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
