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

  // Relay a heuristic run request from any client (FE) to all clients (including heuristic client)
  @SubscribeMessage('heuristic:request-run')
  handleHeuristicRequestRun(@MessageBody() payload: any) {
    console.log('Received heuristic:request-run with payload:', payload);
    this.server.emit('heuristic:request-run', payload);
  }

  // Relay heuristic lifecycle + step events from heuristic client to all FE clients
  @SubscribeMessage('heuristic:run-start')
  handleHeuristicRunStart(@MessageBody() payload: any) {
    console.log('Received heuristic:run-start with payload:', payload);
    this.server.emit('heuristic:run-start', payload);
  }

  @SubscribeMessage('heuristic:step')
  handleHeuristicStep(@MessageBody() payload: any) {
    console.log('Received heuristic:step with payload:', payload);
    this.server.emit('heuristic:step', payload);
  }

  @SubscribeMessage('heuristic:complete')
  handleHeuristicComplete(@MessageBody() payload: any) {
    console.log('Received heuristic:complete with payload:', payload);
    this.server.emit('heuristic:complete', payload);
  }
}
