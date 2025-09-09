// src/grpc/monitor.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { NodeService } from './node.service';

interface HeartbeatRequest {
  nodeId: string;
  timestampMs: string | number;
  ip: string;
  hostName: string;
}

@Controller()
export class NodeController {
  constructor(private readonly nodes: NodeService) {}

  @GrpcStreamMethod('NodeMonitor', 'Heartbeat')
  async heartbeat(
    stream: Observable<HeartbeatRequest>,
  ): Promise<{ status: string }> {
    return new Promise((resolve, reject) => {
      const sub = stream.subscribe({
        next: async (msg) => {
          const ts =
            typeof msg.timestampMs === 'string'
              ? parseInt(msg.timestampMs, 10)
              : msg.timestampMs;
          await this.nodes.upsertBeat({
            nodeId: msg.nodeId,
            ip: msg.ip,
            ts,
            hostName: msg.hostName,
          });
        },
        error: (err) => {
          sub.unsubscribe();
          reject(err);
        },
        complete: () => {
          sub.unsubscribe();
          resolve({ status: 'ok' });
        },
      });
    });
  }
}
