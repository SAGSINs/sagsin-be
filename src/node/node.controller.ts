// src/grpc/monitor.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { NodeService } from './node.service';

interface HeartbeatRequest {
  ip: string;
  hostname: string;
  links?: any[]; // Array of link metrics
}

@Controller()
export class NodeController {
  constructor(private readonly nodes: NodeService) { }

  @GrpcStreamMethod('NodeMonitor', 'Heartbeat')
  async heartbeat(
    stream: Observable<HeartbeatRequest>,
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      const sub = stream.subscribe({
        next: async (msg) => {
          await this.nodes.upsertBeat({
            ip: msg.ip,
            hostname: msg.hostname,
            links: msg.links || []
          });
        },
        error: (err) => {
          sub.unsubscribe();
          reject(err);
        },
        complete: () => {
          sub.unsubscribe();
          resolve({ success: true, message: 'ok' });
        },
      });
    });
  }
}
