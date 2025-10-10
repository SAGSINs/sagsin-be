import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../../proto/heuristic.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const heuristicProto: any = grpc.loadPackageDefinition(packageDef).heuristic;

export const heuristicClient = new heuristicProto.HeuristicService(
    process.env.HEURISTIC_URL || 'localhost:50052',
    grpc.credentials.createInsecure(),
);
