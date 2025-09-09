import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from './entities/node.entity';
import { NodeStatus } from './domain/node-status.vo';

const HEARTBEAT_TIMEOUT_MS = 15_000;

@Injectable()
export class NodeService {
  private readonly logger = new Logger(NodeService.name);
  // map để theo dõi timer mỗi node
  private timers = new Map<string, NodeJS.Timeout>();

  constructor(
    @InjectModel(NodeSchemaClass.name) private model: Model<NodeSchemaClass>,
  ) {}

  async upsertBeat(payload: {
    nodeId: string;
    ip: string;
    ts: number;
    hostName: string;
  }) {
    const { nodeId, ts, ...rest } = payload;

    await this.model.updateOne(
      { nodeId },
      {
        $set: {
          nodeId,
          lastSeenAt: new Date(ts),
          status: NodeStatus.UP,
          ...rest,
        },
      },
      { upsert: true },
    );

    // reset watchdog
    if (this.timers.has(nodeId)) clearTimeout(this.timers.get(nodeId)!);
    this.timers.set(
      nodeId,
      setTimeout(async () => {
        this.logger.warn(`Node ${nodeId} timed out -> DOWN`);
        await this.model.updateOne(
          { nodeId },
          { $set: { status: NodeStatus.DOWN } },
        );
      }, HEARTBEAT_TIMEOUT_MS),
    );
  }
}
