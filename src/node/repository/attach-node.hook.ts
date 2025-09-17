import { HeartbeatGateway } from "src/heartbeat/heartbeat.gateway";
import { Connection } from "mongoose";

export function attachNodeHooks(schema, connection: Connection, gateway: HeartbeatGateway, modelName: string) {
    schema.post('findOneAndUpdate', async function () {
        const model = connection.model(modelName);
        const nodes = await model.find().exec();
        gateway.server.emit('node-updated', nodes);
    });
}