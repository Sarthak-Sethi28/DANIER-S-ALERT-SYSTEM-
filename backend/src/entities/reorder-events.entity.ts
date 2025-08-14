import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('reorder_events')
export class ReorderEvents {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  item_no: string;

  @Column({ type: 'int' })
  old_on_hand: number;

  @Column({ type: 'int' })
  reorder_quantity: number;

  @Column({ type: 'int' })
  new_on_hand: number;

  @Column({ type: 'varchar', length: 100 })
  trigger_reason: string;

  @Column({ type: 'varchar', length: 20 })
  tier_at_time: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  event_date: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => InventoryState, inventoryState => inventoryState.reorder_events)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  inventory_state: InventoryState;
} 