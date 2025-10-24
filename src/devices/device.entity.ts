import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Device {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string; // ex: "RT-Phone-1"

  @Column({ unique: true })
  serial: string; // serial unic al device-ului

  @Column({ nullable: true })
  model?: string;

  @Column({ default: 'offline' })
  status: 'online' | 'offline' = 'offline';

  @Column({ nullable: true })
  firmwareVersion?: string;

  @CreateDateColumn()
  createdAt: Date;
}
