import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tier_config')
export class TierConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  tier_name: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  tier_percentage: number;

  @Column({ type: 'int' })
  reorder_quantity: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  threshold_multiplier: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;
} 