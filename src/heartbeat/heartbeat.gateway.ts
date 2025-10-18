import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { algorithmStreamClient } from 'src/heuristic/heuristic.client';

@WebSocketGateway({ cors: { origin: '*' } })
export class HeartbeatGateway implements OnGatewayInit, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('[WS] Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`[WS] Client connected: ${client.id} (${client.handshake.address})`);
  }

  @SubscribeMessage('heuristic:request-run')
  handleHeuristicRequestRun(@MessageBody() payload: any) {
    const { algo, src, dst } = payload;

    const call = algorithmStreamClient.RunAlgorithm({ algo, src, dst });

    call.on('data', (event: any) => {
      if (event.run_start) {
        this.server.emit('heuristic:run-start', {
          algo: event.run_start.algo,
          src: event.run_start.src,
          dst: event.run_start.dst,
        });
      } else if (event.step) {
        this.server.emit('heuristic:step', {
          algo: event.step.algo,
          step: event.step.step,
          action: event.step.action,
          node: event.step.node,
          from: event.step.from_node,
          to: event.step.to_node,
          open_size: event.step.open_size,
          g: event.step.g,
          f: event.step.f,
          dist: event.step.dist,
          path: event.step.path,
        });
      } else if (event.complete) {
        this.server.emit('heuristic:complete', {
          algo: event.complete.algo,
          src: event.complete.src,
          dst: event.complete.dst,
          result: event.complete.result ? {
            path: event.complete.result.path,
            total_weight: event.complete.result.total_weight,
            total_delay_ms: event.complete.result.total_delay_ms,
            total_jitter_ms: event.complete.result.total_jitter_ms,
            avg_loss_rate: event.complete.result.avg_loss_rate,
            min_bandwidth_mbps: event.complete.result.min_bandwidth_mbps,
            hop_count: event.complete.result.hop_count,
            stability_score: event.complete.result.stability_score,
          } : null,
        });
      }
    });

    call.on('end', () => {
      console.log('[gRPC] Stream ended');
    });

    call.on('error', (err: any) => {
      console.error('[gRPC] Stream error:', err);
      this.server.emit('heuristic:error', {
        message: err.message,
        algo,
        src,
        dst,
      });
    });
  }
}
