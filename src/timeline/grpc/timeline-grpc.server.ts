import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { Logger } from '@nestjs/common';
import { TimelineService } from '../timeline.service';

const TIMELINE_PROTO_PATH = join(__dirname, '../../../proto/timeline.proto');

const timelinePackageDef = protoLoader.loadSync(TIMELINE_PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const timelineProto: any = grpc.loadPackageDefinition(timelinePackageDef).timeline;

/**
 * gRPC Server for Timeline Service
 * Listens on port 50053 for timeline updates from file agents
 */
export class TimelineGrpcServer {
    private server: grpc.Server;
    private readonly port: string;
    private readonly logger = new Logger(TimelineGrpcServer.name);

    constructor(
        private readonly timelineService: TimelineService,
        port: string = '0.0.0.0:50053'
    ) {
        this.port = port;
        this.server = new grpc.Server();
        this.setupServer();
    }

    private setupServer() {
        this.server.addService(timelineProto.TimelineService.service, {
            SendTimelineUpdate: this.handleTimelineUpdate.bind(this),
            StreamTimelineUpdates: this.handleTimelineStream.bind(this),
        });
    }

    private async handleTimelineUpdate(
        call: grpc.ServerUnaryCall<any, any>,
        callback: grpc.sendUnaryData<any>
    ) {
        try {
            console.log('Received timeline update via gRPC', call.request);
            const { transfer_id, hostname, timestamp, status } = call.request;

            // Save to database via timeline service
            await this.timelineService.addTimelineUpdate(
                transfer_id,
                hostname,
                timestamp,
                status
            );

            callback(null, {
                success: true,
                message: 'Timeline update saved successfully'
            });
        } catch (error) {
            this.logger.error('Error handling update:', error);
            callback({
                code: grpc.status.INTERNAL,
                message: error.message
            }, null);
        }
    }

    private handleTimelineStream(call: grpc.ServerReadableStream<any, any>) {
        this.logger.log('Stream connection established');

        call.on('data', async (update: any) => {
            try {
                const { transfer_id, hostname, timestamp, status } = update;

                const statusValue = status === 1 ? 'DONE' : 'PENDING';
                this.logger.log(`Stream update: ${transfer_id} @ ${hostname} → ${statusValue}`);

                await this.timelineService.addTimelineUpdate(
                    transfer_id,
                    hostname,
                    timestamp,
                    statusValue as 'DONE' | 'PENDING'
                );
            } catch (error) {
                this.logger.error('Error processing stream update:', error);
            }
        });

        call.on('end', () => {
            this.logger.log('Stream ended');
        });

        call.on('error', (error) => {
            this.logger.error('Stream error:', error);
        });
    }

    async start() {
        return new Promise<void>((resolve, reject) => {
            this.server.bindAsync(
                this.port,
                grpc.ServerCredentials.createInsecure(),
                (error, port) => {
                    if (error) {
                        this.logger.error('Failed to start:', error);
                        reject(error);
                        return;
                    }
                    this.server.start();
                    this.logger.log(`🎧 gRPC Server listening on ${this.port}`);
                    resolve();
                }
            );
        });
    }

    async stop() {
        return new Promise<void>((resolve) => {
            this.server.tryShutdown(() => {
                this.logger.log('Server stopped');
                resolve();
            });
        });
    }
}
