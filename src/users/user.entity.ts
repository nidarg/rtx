import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type UserRole = 'admin' | 'operator';

@Entity()
export class User {
  // ID unic generat automat
  @PrimaryGeneratedColumn()
  id: number;

  // username-ul folosit la login
  @Column({ unique: true })
  username: string;

  // parola hash-uită (NU plaintext!)
  @Column()
  password: string;

  // rolul utilizatorului (admin / operator)
  @Column({ type: 'enum', enum: ['admin', 'operator'], default: 'operator' })
  role: UserRole;

  // opțional, pentru afișare UI
  @Column({ nullable: true })
  fullName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
