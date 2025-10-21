import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

// Load HeuristicService proto
const HEURISTIC_PROTO_PATH = join(__dirname, '../../proto/heuristic.proto');

const heuristicPackageDef = protoLoader.loadSync(HEURISTIC_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const heuristicProto: any =
  grpc.loadPackageDefinition(heuristicPackageDef).heuristic;

export const heuristicClient = new heuristicProto.HeuristicService(
  process.env.HEURISTIC_URL || 'localhost:50052',
  grpc.credentials.createInsecure(),
);

// Load AlgorithmStreamService proto
const ALGORITHM_PROTO_PATH = join(
  __dirname,
  '../../proto/algorithm_stream.proto',
);

const algorithmPackageDef = protoLoader.loadSync(ALGORITHM_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const algorithmProto: any =
  grpc.loadPackageDefinition(algorithmPackageDef).heuristic;

export const algorithmStreamClient = new algorithmProto.AlgorithmStreamService(
  process.env.HEURISTIC_URL || 'localhost:50052',
  grpc.credentials.createInsecure(),
);
