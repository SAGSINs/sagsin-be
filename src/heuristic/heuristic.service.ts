import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NodeSchemaClass } from 'src/node/entities/node.entity';
import { LinkSchemaClass } from 'src/links/entities/link.entity';
import { heuristicClient } from './heuristic.client';

@Injectable()
export class HeuristicService {
  private readonly TIMEOUT_MS = 7000;
  private readonly logger = new Logger(HeuristicService.name);

  constructor(
    @InjectModel(NodeSchemaClass.name)
    private readonly nodeModel: Model<NodeSchemaClass>,
    @InjectModel(LinkSchemaClass.name)
    private readonly linkModel: Model<LinkSchemaClass>,
  ) { }

  @Cron('*/3 * * * * *')
  async sendGraphSnapshot(): Promise<void> {
    try {
      const [nodes, links] = await Promise.all([
        this.nodeModel.find().lean(),
        this.linkModel.find().lean(),
      ]);

      const now = new Date();
      const updatedNodes: any[] = [];
      const updatedLinks: any[] = [];

      for (const node of nodes) {
        const nodeWithTimestamp = node as any;
        const updatedAt = nodeWithTimestamp.updatedAt
          ? new Date(nodeWithTimestamp.updatedAt)
          : new Date(0);
        const timeDiff = now.getTime() - updatedAt.getTime();

        if (timeDiff > this.TIMEOUT_MS && node.status === 'UP') {
          await this.nodeModel.findOneAndUpdate(
            { _id: nodeWithTimestamp._id },
            { $set: { status: 'DOWN' } },
          );

          updatedNodes.push({
            ...node,
            status: 'DOWN',
          });
        }
      }

      for (const link of links) {
        const linkWithTimestamp = link as any;
        const updatedAt = linkWithTimestamp.updatedAt
          ? new Date(linkWithTimestamp.updatedAt)
          : new Date(0);
        const timeDiff = now.getTime() - updatedAt.getTime();

        if (timeDiff > this.TIMEOUT_MS && link.available === true) {
          await this.linkModel.findOneAndUpdate(
            { _id: linkWithTimestamp._id },
            { $set: { available: false } },
          );

          updatedLinks.push({
            ...link,
            available: false,
          });
        }
      }

      const finalNodes = nodes.map((n) => {
        const updated = updatedNodes.find(
          (un) => (un as any)._id?.toString() === (n as any)._id?.toString(),
        );
        return updated || n;
      });

      const finalLinks = links.map((l) => {
        const updated = updatedLinks.find(
          (ul) => (ul as any)._id?.toString() === (l as any)._id?.toString(),
        );
        return updated || l;
      });

      const graphSnapshot = {
        timestamp: new Date().toISOString(),
        nodes: finalNodes.map((n) => ({
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
        links: finalLinks.map((l) => ({
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
      });
    } catch (error) {
      this.logger.error('Error in heuristic cron job:', error);
    }
  }
}
