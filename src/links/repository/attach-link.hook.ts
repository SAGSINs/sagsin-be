import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';
import { Connection, Schema } from 'mongoose';

export function attachLinkHooks(
  schema: Schema,
  connection: Connection,
  gateway: HeartbeatGateway,
  modelName: string,
) {
  schema.post('updateOne', async function () {
    const model = connection.model(modelName);
    const links = await model.find().exec();
    gateway.server.emit('link-updated', links);
  });

  schema.post('updateMany', async function () {
    const model = connection.model(modelName);
    const links = await model.find().exec();
    gateway.server.emit('link-updated', links);
  });
}
