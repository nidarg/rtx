import { DataSourceOptions } from 'typeorm';
import { Device } from './devices/device.entity';
import { User } from './users/user.entity';

const config: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST || 'db', // în docker-compose serviciul se numește 'db'
  port: +(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || 'rootpwd',
  database: process.env.DB_NAME || 'rtx',
  entities: [Device, User],
  synchronize: true, // DO NOT use true în prod; folosește migrations
  logging: false,
};

export default config;
