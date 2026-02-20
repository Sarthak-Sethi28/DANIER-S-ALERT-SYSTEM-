import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('tier_changes')
export class TierChanges {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  item_no: string;

  @Column({ type: 'varchar', length: 20 })
  old_tier: string;

  @Column({ type: 'varchar', length: 20 })
  new_tier: string;

  @Column({ type: 'int' })
  six_month_sales: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  change_date: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => InventoryState, inventoryState => inventoryState.tier_changes)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  inventory_state: InventoryState;
} 