import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';

export function attachNodeHooks(
  schema,
  gateway: HeartbeatGateway,
) {
  schema.post('findOneAndUpdate', async function (doc) {
    if (doc) {
      gateway.server.emit('node-updated', doc);
    }
  });
}
