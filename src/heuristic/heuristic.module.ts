import { forwardRef, Module } from '@nestjs/common';
import { HeuristicService } from './heuristic.service';
import { LinksModule } from 'src/links/links.module';
import { NodeModule } from 'src/node/node.module';

@Module({
  imports: [
    forwardRef(() => NodeModule),
    forwardRef(() => LinksModule),
  ],
  providers: [HeuristicService],
})
export class HeuristicModule { }
