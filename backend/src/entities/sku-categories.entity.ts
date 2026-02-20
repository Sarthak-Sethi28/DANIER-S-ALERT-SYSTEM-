import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { InventoryState } from './inventory-state.entity';

@Entity('sku_categories')
export class SkuCategories {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  item_no: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  product_family: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  brand: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updated_at: Date;

  // Relationships
  @OneToOne(() => InventoryState, inventoryState => inventoryState.sku_category)
  @JoinColumn({ name: 'item_no', referencedColumnName: 'item_no' })
  inventory_state: InventoryState;
} 