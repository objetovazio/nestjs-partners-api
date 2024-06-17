import { Module } from '@nestjs/common';
import { CoreService } from './core.service';
import { AuthModule } from './auth/auth.module';
import { TestModule } from './test/test.module';

@Module({
  providers: [CoreService],
  exports: [CoreService],
  imports: [AuthModule, TestModule],
})
export class CoreModule {}
