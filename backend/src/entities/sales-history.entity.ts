import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('sales_history')
export class SalesHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  item_no: string;

  @Column({ type: 'int' })
  units_sold: number;

  @Column({ type: 'date' })
  sale_date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  sale_amount: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => InventoryState, inventoryState => inventoryState.sales_history)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  inventory_state: InventoryState;
} 