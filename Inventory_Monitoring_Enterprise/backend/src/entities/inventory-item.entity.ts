import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  product_group_code: string;

  @Column({ type: 'varchar', length: 100 })
  style: string;

  @Column({ type: 'varchar', length: 50 })
  item_number: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  season_code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  variant_color: string;

  @Column({ type: 'varchar', length: 20 })
  variant_code: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  barcode: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  selling_price: number;

  @Column({ type: 'varchar', length: 20, default: 'okay' })
  tier: string;

  @Column({ type: 'int', default: 100 })
  reorder_threshold: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => InventoryState, state => state.item)
  inventory_states: InventoryState[];
} 