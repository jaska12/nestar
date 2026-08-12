import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestarBatchController } from './nestar-batch.controller';
import { NestarBatchService } from './nestar-batch.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [NestarBatchController],
  providers: [NestarBatchService],
})
export class NestarBatchModule { }
