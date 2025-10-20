import { HeartbeatGateway } from 'src/heartbeat/heartbeat.gateway';

export function attachTimelineHooks(
    schema: any,
    gateway: HeartbeatGateway,
) {
    // Emit event khi timeline được update
    schema.post('save', async function (doc: any) {
        if (doc) {
            gateway.server.emit('timeline:updated', {
                transferId: doc._id,
                timeline: doc.timeline,
                updatedAt: doc.updatedAt,
            });
        }
    });

    // Emit event khi timeline được tìm thấy và update
    schema.post('findOneAndUpdate', async function (doc: any) {
        if (doc) {
            gateway.server.emit('timeline:updated', {
                transferId: doc._id,
                timeline: doc.timeline,
                updatedAt: doc.updatedAt,
            });
        }
    });
}
