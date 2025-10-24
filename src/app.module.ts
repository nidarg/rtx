import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import config from './ormconfig';
import { UsersModule } from './users/users.module';
import { DevicesModule } from './devices/devices.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(config), // folosește config-ul exportat
    UsersModule,
    DevicesModule,
  ],
})
export class AppModule {}
