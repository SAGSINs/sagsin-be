import { Injectable } from '@nestjs/common';
import { CreateHeartbeatDto } from './dto/create-heartbeat.dto';
import { UpdateHeartbeatDto } from './dto/update-heartbeat.dto';

@Injectable()
export class HeartbeatService {
  create(createHeartbeatDto: CreateHeartbeatDto) {
    return 'This action adds a new heartbeat';
  }

  findAll() {
    return `This action returns all heartbeat`;
  }

  findOne(id: number) {
    return `This action returns a #${id} heartbeat`;
  }

  update(id: number, updateHeartbeatDto: UpdateHeartbeatDto) {
    return `This action updates a #${id} heartbeat`;
  }

  remove(id: number) {
    return `This action removes a #${id} heartbeat`;
  }
}
