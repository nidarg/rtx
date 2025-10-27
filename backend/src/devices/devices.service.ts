import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Device } from './device.entity';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { MqttService } from 'src/mqtt/mqtt.service';

@Injectable()
export class DevicesService {
  constructor(
    @InjectRepository(Device)
    private readonly deviceRepo: Repository<Device>,
    private mqttService: MqttService,
  ) {}

  async create(createDeviceDto: CreateDeviceDto): Promise<Device> {
    const { serial } = createDeviceDto;

    // verificăm dacă serialul există deja
    const existing = await this.deviceRepo.findOne({ where: { serial } });
    if (existing) {
      throw new BadRequestException(
        `Device with serial ${serial} already exists`,
      );
    }

    const device = this.deviceRepo.create(createDeviceDto);
    return this.deviceRepo.save(device);
  }

  // Optional: alte metode
  async findAll(): Promise<Device[]> {
    return this.deviceRepo.find();
  }

  async findOne(id: number): Promise<Device> {
    const device = await this.deviceRepo.findOne({ where: { id } });
    if (!device) throw new NotFoundException(`Device #${id} not found`);
    return device;
  }
  async update(id: number, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
    const device = await this.findOne(id); // aruncă NotFound dacă nu există
    Object.assign(device, updateDeviceDto); // updatează câmpurile primite
    return this.deviceRepo.save(device);
  }

  async remove(id: number): Promise<void> {
    const result = await this.deviceRepo.delete(id);
    if (result.affected === 0) throw new NotFoundException('Device not found');
  }

  async sendCommand(deviceId: number, command: string, payload?: any) {
    const device = await this.deviceRepo.findOne({ where: { id: deviceId } });
    if (!device) throw new NotFoundException('Device not found');

    const cmd = {
      command,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      payload: payload || {},
      timestamp: new Date().toISOString(),
    };

    // publicăm comanda pe topicul device-ului
    this.mqttService.publish(
      `devices/${device.serial}/commands`,
      JSON.stringify(cmd),
    );

    // Poți salva comanda în DB ca pending, dacă ai tabel Commands
    return { message: 'Command sent', cmd };
  }
}
