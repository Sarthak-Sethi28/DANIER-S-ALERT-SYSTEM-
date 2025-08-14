import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { SalesHistory } from './sales-history.entity';
import { SkuCategories } from './sku-categories.entity';
import { ReorderEvents } from './reorder-events.entity';
import { TierChanges } from './tier-changes.entity';
import { AlertHistory } from './alert-history.entity';

export enum Tier {
  BEST_SELLERS = 'Best Sellers',
  DOING_GOOD = 'Doing Good',
  MAKING_PROGRESS = 'Making Progress',
  OKAY = 'Okay'
}

@Entity('inventory_state')
export class InventoryState {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  item_no: string;

  @Column({ type: 'int', default: 0 })
  on_hand_qty: number;

  @Column({ type: 'int', default: 0 })
  reorder_point: number;

  @Column({ 
    type: 'enum', 
    enum: Tier, 
    default: Tier.OKAY 
  })
  tier: Tier;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  last_updated: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relationships
  @OneToMany(() => SalesHistory, salesHistory => salesHistory.inventory_state)
  sales_history: SalesHistory[];

  @OneToOne(() => SkuCategories, skuCategories => skuCategories.inventory_state)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  sku_category: SkuCategories;

  @OneToMany(() => ReorderEvents, reorderEvents => reorderEvents.inventory_state)
  reorder_events: ReorderEvents[];

  @OneToMany(() => TierChanges, tierChanges => tierChanges.inventory_state)
  tier_changes: TierChanges[];

  @OneToMany(() => AlertHistory, alertHistory => alertHistory.inventory_state)
  alert_history: AlertHistory[];

  // Helper methods
  isLowStock(): boolean {
    return this.on_hand_qty < this.reorder_point;
  }

  getStockLevel(): number {
    return this.reorder_point > 0 ? this.on_hand_qty / this.reorder_point : 0;
  }

  isBestSeller(): boolean {
    return this.tier === Tier.BEST_SELLERS;
  }
} 