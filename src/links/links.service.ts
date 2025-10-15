import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LinkSchemaClass } from './entities/link.entity';
import * as _ from 'lodash';

@Injectable()
export class LinksService {
    private readonly logger = new Logger(LinksService.name);

    constructor(
        @InjectModel(LinkSchemaClass.name) private model: Model<LinkSchemaClass>,
    ) { }

    async updateLinks(srcNode: string, neighbors: Array<any>) {
        if (!Array.isArray(neighbors)) {
            this.logger.warn(`Invalid neighbors data from ${srcNode}`);
            return;
        }

        const neighborIds = neighbors
            .map((n) => n.neighbor_id || n.neighborId || n.hostname || n.ip)
            .filter(Boolean);

        for (const n of neighbors) {
            const dest = n.neighbor_id || n.neighborId || n.hostname || n.ip;
            if (!dest) {
                continue;
            }

            const update: any = {
                srcNodeName: _.startCase(srcNode),
                destNodeName: _.startCase(dest),
                srcNode,
                destNode: dest,
                available: typeof n.available === 'boolean' ? n.available : true,
                metrics: {
                    delayMs: n.delay_ms ?? n.delayMs ?? n.delay ?? null,
                    jitterMs: n.jitter_ms ?? n.jitterMs ?? null,
                    lossRate: n.loss_rate ?? null,
                    bandwidthMbps: n.bandwidth_mbps ?? n.bandwidthMbps ?? null,
                    queueLength: n.queue_length ?? n.queueLength ?? null,
                },
                updatedAt: new Date(),
            };

            if (update.metrics.delay_ms === null)
                break;

            try {
                await this.model.updateOne(
                    { srcNode, destNode: dest },
                    { $set: update },
                    { upsert: true },
                );
            } catch (err) {
                this.logger.error('Failed to upsert link', err as any);
            }
        }

        if (!neighborIds || neighborIds.length === 0) {
            return;
        }

        try {
            await this.model.updateMany(
                { srcNode, destNode: { $nin: neighborIds } },
                { $set: { available: false, updatedAt: new Date() } },
            );
        } catch (err) {
            this.logger.error('Failed to mark missing links unavailable', err as any);
        }
    }
}
