import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('alert_history')
export class AlertHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  alert_type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  item_no: string;

  @Column({ type: 'varchar', length: 200 })
  subject: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'text' })
  recipients: string;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  sent_at: Date;

  @Column({ type: 'varchar', length: 20, default: 'sent' })
  status: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  // Relationships
  @ManyToOne(() => InventoryState, inventoryState => inventoryState.alert_history)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  inventory_state: InventoryState;
} 