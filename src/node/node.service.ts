import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';

const HEARTBEAT_TIMEOUT_MS = 15_000;

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
  }) {
    const { ip, hostname } = payload;

    await this.model.updateOne(
      { ip },
      {
        $set: {
          ip,
          hostname,
          status: NodeStatus.UP,
        },
      },
      { upsert: true },
    );

    // reset watchdog
    if (this.timers.has(ip)) clearTimeout(this.timers.get(ip)!);
    this.timers.set(
      ip,
      setTimeout(async () => {
        this.logger.warn(`Node ${ip} timed out -> DOWN`);
        await this.model.updateOne(
          { ip },
          { $set: { status: NodeStatus.DOWN } },
        );
      }, HEARTBEAT_TIMEOUT_MS),
    );
  }
}
