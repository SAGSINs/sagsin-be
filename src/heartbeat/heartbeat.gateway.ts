import { MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

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
    this.server.emit('heuristic:request-run', payload);
  }

  @SubscribeMessage('heuristic:run-start')
  handleHeuristicRunStart(@MessageBody() payload: any) {
    this.server.emit('heuristic:run-start', payload);
  }

  @SubscribeMessage('heuristic:step')
  handleHeuristicStep(@MessageBody() payload: any) {
    this.server.emit('heuristic:step', payload);
  }

  @SubscribeMessage('heuristic:complete')
  handleHeuristicComplete(@MessageBody() payload: any) {
    this.server.emit('heuristic:complete', payload);
  }
}
