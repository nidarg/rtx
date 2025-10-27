import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { MqttService } from '../mqtt/mqtt.service';

@Injectable()
export class DeviceSimulatorService implements OnModuleInit {
  private logger = new Logger('DeviceSimulator');

  constructor(
    private readonly mqttService: MqttService,
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
  ) {}

  async onModuleInit() {
    // 🔹 1️⃣ Când aplicația pornește, luăm toate device-urile din DB
    const devices = await this.deviceRepo.find();

    this.logger.log(`Found ${devices.length} devices to simulate`);

    // 🔹 2️⃣ Pornim simularea pentru fiecare device
    devices.forEach((device) => {
      this.startDevice(device);
    });
  }

  startDevice(device: Device) {
    device.status = 'online';
    this.logger.log(`Device ${device.serial} started simulation`);

    // 🔹 Abonare la topicul de comenzi al device-ului
    this.mqttService.subscribe(
      `devices/${device.serial}/commands`,
      (topic, message) => {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const cmd = JSON.parse(message.toString());
          this.logger.log(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Device ${device.serial} received command: ${cmd.command}`,
          );
          this.executeCommand(device, cmd);
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
          this.logger.error(`Failed to parse command for ${device.serial}`);
        }
      },
    );

    // 🔹 Trimitem telemetrie periodic (la 5 secunde)
    setInterval(() => {
      const telemetry = {
        status: device.status,
        firmwareVersion: device.firmwareVersion || '1.0.0',
        metrics: {
          cpu: Math.floor(Math.random() * 100),
          memory: Math.floor(Math.random() * 100),
        },
        timestamp: new Date().toISOString(),
      };

      this.mqttService.publish(
        `devices/${device.serial}/telemetry`,
        JSON.stringify(telemetry),
      );
    }, 5000);
  }

  executeCommand(device: Device, cmd: { command: string; payload?: any }) {
    if (cmd.command === 'restart') {
      device.status = 'offline';
      this.logger.log(`Device ${device.serial} restarting...`);
      setTimeout(() => {
        device.status = 'online';
        this.logger.log(`Device ${device.serial} restarted`);
      }, 3000);
    }

    if (cmd.command === 'updateFirmware') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const version = cmd.payload?.version;
      if (version) {
        this.logger.log(
          `Device ${device.serial} updating firmware to ${version}`,
        );
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          device.firmwareVersion = version;
          this.logger.log(
            `Device ${device.serial} firmware updated to ${version}`,
          );
        }, 3000);
      } else {
        this.logger.warn(
          `Device ${device.serial} received updateFirmware but no version`,
        );
      }
    }
  }
}
