import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from 'src/node/entities/node.entity';
import { LinkSchemaClass } from 'src/links/entities/link.entity';
import { heuristicClient } from './heuristic.client';

@Injectable()
export class HeuristicService {
  private readonly logger = new Logger(HeuristicService.name);

  constructor(
    @InjectModel(NodeSchemaClass.name)
    private readonly nodeModel: Model<NodeSchemaClass>,
    @InjectModel(LinkSchemaClass.name)
    private readonly linkModel: Model<LinkSchemaClass>,
  ) {}

  @Cron('*/3 * * * * *')
  async sendGraphSnapshot(): Promise<void> {
    try {
      const [nodes, links] = await Promise.all([
        this.nodeModel.find().lean(),
        this.linkModel.find().lean(),
      ]);

      const graphSnapshot = {
        timestamp: new Date().toISOString(),
        nodes: nodes.map((n) => ({
          id: n.hostname,
          type: n.type,
          status: n.status,
          metrics: {
            cpu_load: n.metrics?.cpuLoad ?? 0,
            jitter_ms: n.metrics?.jitterMs ?? 0,
            queue_len: n.metrics?.queueLen ?? 0,
            throughput_mbps: n.metrics?.throughputMbps ?? 0,
          },
        })),
        links: links.map((l) => ({
          src: l.srcNode,
          dst: l.destNode,
          available: l.available,
          metrics: {
            delay_ms: l.metrics?.delayMs ?? 0,
            jitter_ms: l.metrics?.jitterMs ?? 0,
            loss_rate: 0,
            bandwidth_mbps: l.metrics?.bandwidthMbps ?? 0,
          },
        })),
      };

      heuristicClient.UpdateGraph(graphSnapshot, (err: any, _: any) => {
        if (err) {
          this.logger.warn(`Heuristic update failed: ${err.message}`);
        }
      });
    } catch (error) {
      this.logger.error('Error in heuristic cron job:', error);
    }
  }
}
