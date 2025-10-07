// src/grpc/monitor.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { NodeService } from './node.service';
import { LinksService } from 'src/links/links.service';

interface HeartbeatRequest {
  ip: string;
  hostname: string;
  links: any[];
}

@Controller()
export class NodeController {
  constructor(
    private readonly nodes: NodeService,
    private readonly links: LinksService,
  ) {}

  @GrpcStreamMethod('NodeMonitor', 'Heartbeat')
  async heartbeat(
    stream: Observable<HeartbeatRequest>,
  ): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve, reject) => {
      const sub = stream.subscribe({
        next: async (msg) => {
          await this.nodes.updateNode({
            ip: msg.ip,
            hostname: msg.hostname,
          });
          await this.links.updateLinks(msg.hostname, msg.links);
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
