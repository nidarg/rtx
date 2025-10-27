import { DataSourceOptions } from 'typeorm';
import { Device } from './devices/device.entity';
import { User } from './users/user.entity';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST, // în docker-compose serviciul se numește 'db'
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Device, User],
  synchronize: true, // DO NOT use true în prod; folosește migrations
  logging: false,
};

export default config;
