import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';

@Entity('inventory_states')
export class InventoryState {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  item_id: number;

  @Column({ type: 'varchar', length: 50 })
  location_code: string;

  @Column({ type: 'int', default: 0 })
  quantity_on_hand: number;

  @Column({ type: 'int', default: 0 })
  quantity_sold: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total_value: number;

  @CreateDateColumn()
  last_updated: Date;

  @ManyToOne(() => InventoryItem, item => item.inventory_states)
  @JoinColumn({ name: 'item_id' })
  item: InventoryItem;
} 