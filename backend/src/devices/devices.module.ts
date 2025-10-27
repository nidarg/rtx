import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesService } from './devices.service';
import { DevicesController } from './devices.controller';
import { DeviceSimulatorService } from './device-simulator.service';
import { Device } from './device.entity';
import { MqttModule } from 'src/mqtt/mqtt.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Device]), // injectează repository-ul Device
    MqttModule,
  ],
  providers: [DevicesService, DeviceSimulatorService],
  controllers: [DevicesController],
  exports: [DevicesService],
})
export class DevicesModule {}
