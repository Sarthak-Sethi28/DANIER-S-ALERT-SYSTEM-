-- Inventory Monitoring Enterprise - Initial Database Schema
-- This migration creates all core tables for the inventory management system

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Inventory State Table - Maintains current on-hand quantities
CREATE TABLE inventory_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(50) NOT NULL UNIQUE,
    on_hand_qty INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 0,
    tier VARCHAR(20) NOT NULL DEFAULT 'Okay',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales History Table - Tracks all sales transactions
CREATE TABLE sales_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(50) NOT NULL,
    units_sold INTEGER NOT NULL,
    sale_date DATE NOT NULL,
    sale_amount DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_no) REFERENCES inventory_state(item_no) ON DELETE CASCADE
);

-- SKU Categories Table - Defines product categorization
CREATE TABLE sku_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100),
    product_family VARCHAR(100),
    brand VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_no) REFERENCES inventory_state(item_no) ON DELETE CASCADE
);

-- Tier Configuration Table - Defines tier thresholds and reorder quantities
CREATE TABLE tier_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tier_name VARCHAR(20) NOT NULL UNIQUE,
    tier_percentage DECIMAL(5,2) NOT NULL,
    reorder_quantity INTEGER NOT NULL,
    threshold_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Reorder Events Table - Tracks all automatic reorder actions
CREATE TABLE reorder_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(50) NOT NULL,
    old_on_hand INTEGER NOT NULL,
    reorder_quantity INTEGER NOT NULL,
    new_on_hand INTEGER NOT NULL,
    trigger_reason VARCHAR(100) NOT NULL,
    tier_at_time VARCHAR(20) NOT NULL,
    event_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_no) REFERENCES inventory_state(item_no) ON DELETE CASCADE
);

-- Tier Changes Table - Tracks promotions and demotions
CREATE TABLE tier_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_no VARCHAR(50) NOT NULL,
    old_tier VARCHAR(20) NOT NULL,
    new_tier VARCHAR(20) NOT NULL,
    six_month_sales INTEGER NOT NULL,
    change_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_no) REFERENCES inventory_state(item_no) ON DELETE CASCADE
);

-- Alert History Table - Tracks all sent alerts
CREATE TABLE alert_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_type VARCHAR(50) NOT NULL,
    item_no VARCHAR(50),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    recipients TEXT NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'sent',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_no) REFERENCES inventory_state(item_no) ON DELETE SET NULL
);

-- System Settings Table - Configuration storage
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    is_encrypted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Processing Logs Table - ETL and system operation logs
CREATE TABLE processing_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    log_level VARCHAR(10) NOT NULL,
    component VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_inventory_state_item_no ON inventory_state(item_no);
CREATE INDEX idx_inventory_state_tier ON inventory_state(tier);
CREATE INDEX idx_sales_history_item_no ON sales_history(item_no);
CREATE INDEX idx_sales_history_date ON sales_history(sale_date);
CREATE INDEX idx_reorder_events_item_no ON reorder_events(item_no);
CREATE INDEX idx_reorder_events_date ON reorder_events(event_date);
CREATE INDEX idx_tier_changes_item_no ON tier_changes(item_no);
CREATE INDEX idx_tier_changes_date ON tier_changes(change_date);
CREATE INDEX idx_alert_history_type ON alert_history(alert_type);
CREATE INDEX idx_alert_history_date ON alert_history(sent_at);
CREATE INDEX idx_processing_logs_level ON processing_logs(log_level);
CREATE INDEX idx_processing_logs_component ON processing_logs(component);
CREATE INDEX idx_processing_logs_date ON processing_logs(created_at);

-- Insert default tier configuration
INSERT INTO tier_config (tier_name, tier_percentage, reorder_quantity, threshold_multiplier) VALUES
('Best Sellers', 10.00, 500, 1.5),
('Doing Good', 20.00, 300, 1.2),
('Making Progress', 30.00, 200, 1.0),
('Okay', 40.00, 100, 0.8);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description) VALUES
('smtp_host', 'smtp.gmail.com', 'string', 'SMTP server hostname'),
('smtp_port', '587', 'number', 'SMTP server port'),
('smtp_user', 'alerts@yourcompany.com', 'string', 'SMTP username'),
('smtp_pass', '', 'string', 'SMTP password (encrypted)'),
('alert_recipients', 'ops@yourcompany.com,purchasing@yourcompany.com', 'string', 'Comma-separated email recipients'),
('daily_digest_time', '08:00', 'string', 'Daily digest email time (HH:MM)'),
('etl_schedule', '0 2 * * *', 'string', 'ETL processing schedule (cron format)'),
('nav_export_path', '/data/nav_exports', 'string', 'Path to NAV export files'),
('low_stock_threshold', '0.8', 'number', 'Low stock threshold multiplier'),
('best_seller_threshold', '0.9', 'number', 'Best seller threshold percentage');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_inventory_state_updated_at BEFORE UPDATE ON inventory_state
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sku_categories_updated_at BEFORE UPDATE ON sku_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tier_config_updated_at BEFORE UPDATE ON tier_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 