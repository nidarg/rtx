// src/devices/device.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Patch,
  Delete,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { Device } from './device.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Controller('devices')
@UseGuards(JwtAuthGuard) // toți trebuie să fie autentificați
export class DevicesController {
  constructor(private readonly deviceService: DevicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async create(@Body() createDeviceDto: CreateDeviceDto): Promise<Device> {
    return this.deviceService.create(createDeviceDto);
  }

  @Get()
  async findAll(): Promise<Device[]> {
    return this.deviceService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.deviceService.findOne(+id);
  }
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return await this.deviceService.update(+id, updateDeviceDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async remove(@Param('id') id: string) {
    return await this.deviceService.remove(+id);
  }
  @Post(':id/commands')
  @UseGuards(RolesGuard)
  @Roles('admin') // doar admin poate trimite comenzi
  async sendCommand(
    @Param('id') id: string,
    @Body() body: { command: 'restart' | 'updateFirmware'; payload?: any },
  ) {
    return await this.deviceService.sendCommand(
      +id,
      body.command,
      body.payload,
    );
  }
}
