import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('processing_logs')
export class ProcessingLogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  level: string;

  @Column('text')
  message: string;

  @Column('jsonb', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;
} 