// src/grpc/monitor.controller.ts
import { Controller } from '@nestjs/common';
import { GrpcStreamMethod } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { NodeService } from './node.service';

interface HeartbeatRequest {
  nodeId: string;
  timestampMs: string | number | any; // any để handle Long object
  ip: string;
  hostname: string;
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
          console.log('Received heartbeat from:', msg.nodeId);

          let ts: number;
          if (typeof msg.timestampMs === 'string') {
            ts = parseInt(msg.timestampMs, 10);
          } else if (typeof msg.timestampMs === 'number') {
            ts = msg.timestampMs;
          } else if (msg.timestampMs && typeof msg.timestampMs === 'object') {
            // Handle Long object from protobuf
            ts = Number(msg.timestampMs.toString());
          } else {
            ts = Date.now(); // fallback to current time
          }

          const timestamp = new Date(ts);
          if (isNaN(timestamp.getTime())) {
            console.warn('Invalid timestamp received:', msg.timestampMs);
            return;
          }

          await this.nodes.upsertBeat({
            nodeId: msg.nodeId,
            ip: msg.ip,
            ts: timestamp.getTime(),
            hostName: msg.hostname,
          });

          console.log(`✅ Node ${msg.nodeId} heartbeat saved successfully`);
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
