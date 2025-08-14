# Excel File Analysis & ETL Pipeline Documentation

## Overview

This document provides a comprehensive analysis of the NAV sales export Excel file structure and the ETL pipeline that processes it for the Inventory Monitoring Enterprise system.

## Excel File Structure

### File Details
- **Filename**: `Inventory Report -July 07,2025 (1).xlsx`
- **Total Rows**: 4,095 (including header)
- **Total Columns**: 29
- **Sheet Name**: Sheet1

### Column Structure

The Excel file contains the following key columns (after cleaning):

| Column Index | Original Name | Cleaned Name | Data Type | Description |
|--------------|---------------|--------------|-----------|-------------|
| 1 | Sum of Quantity | Sum of Quantity | Object | Header row |
| 2 | Unnamed: 1 | Style | Object | Product style name |
| 3 | Unnamed: 2 | Item No_ | Object | Unique item number |
| 4 | Unnamed: 3 | Season Code | Object | Season identifier (FA25, SP25, etc.) |
| 5 | Unnamed: 4 | Item Description | Object | Product description |
| 6 | Unnamed: 5 | Variant Color | Object | Product color |
| 7 | Unnamed: 6 | Variant Code | Object | Size/variant code |
| 8 | Unnamed: 7 | Item Barcode | Object | Product barcode |
| 9 | Unnamed: 8 | Selling Price | Object | Product selling price |
| 10 | Location Code | Location Code | Float64 | Primary location quantity |
| 11-27 | Unnamed: 10-26 | 100.0, 103.0, 105.0, etc. | Float64 | Warehouse location quantities |
| 28 | Unnamed: 27 | TRUCK | Object | Truck inventory |
| 29 | Unnamed: 28 | Grand Total | Object | Total inventory |

### Location Codes

The system tracks inventory across 17 different warehouse locations:

- **100.0**: Primary warehouse
- **103.0, 105.0, 106.0, 108.0, 109.0**: Secondary warehouses
- **113.0, 114.0, 116.0, 117.0**: Regional warehouses
- **201.0, 251.0**: Distribution centers
- **301.0, 302.0**: Retail locations
- **401.0, 501.0, 551.0**: Additional storage facilities

### Data Characteristics

#### Product Information
- **Styles**: 653 unique product styles
- **Item Numbers**: 655 unique item numbers
- **Season Codes**: 7 seasons (FA25, SP25, SP24, FA26, KI00, FA24, ALL SEASON)
- **Colors**: 171 unique colors
- **Sizes**: 1,218 unique size codes
- **Price Range**: $7.77 - $1,999.00 (Mean: $247.19, Median: $199.00)

#### Inventory Quantities
- **Total Items**: 4,087 (after cleaning)
- **Total Quantity**: 52,318 units
- **Total Value**: $8,942,175.93
- **Average Quantity per Item**: 12.8 units

## ETL Pipeline Processing

### Processing Steps

1. **File Reading**
   - Read Excel file using pandas
   - Extract column headers from first row
   - Map unnamed columns to proper names

2. **Data Cleaning**
   - Remove rows with missing essential data (Style, Item No_, Variant Code)
   - Convert numeric columns to proper data types
   - Clean text columns (strip whitespace)
   - Handle missing values

3. **Inventory Metrics Calculation**
   - Calculate total quantity across all locations
   - Calculate total value (quantity × price)
   - Calculate days of inventory (placeholder)

4. **Tier Categorization**
   - Sort items by total value (sales performance proxy)
   - Assign tiers based on percentiles:
     - **Best Sellers**: Top 10% (408 items) - 500 unit reorder threshold
     - **Doing Good**: Next 20% (817 items) - 300 unit reorder threshold
     - **Making Progress**: Next 30% (1,226 items) - 200 unit reorder threshold
     - **Okay**: Bottom 40% (1,636 items) - 100 unit reorder threshold

5. **Alert Generation**
   - **Low Stock Alerts**: Items with ≤ 50 units
   - **Critical Stock Alerts**: Items with ≤ 10 units
   - **Reorder Alerts**: Items below tier-specific thresholds

6. **Data Export**
   - Save processed data to CSV and JSON formats
   - Generate alert reports
   - Create summary statistics

### Processing Results

#### Tier Distribution
```
Best Sellers: 408 items (10%)
Doing Good: 817 items (20%)
Making Progress: 1,226 items (30%)
Okay: 1,636 items (40%)
```

#### Top Items by Value
1. ATTICUS TOTE 990.NS.: $23,383.00
2. ATTICUS LAPTOP BAG 990.NS.: $23,034.00
3. ATTICUS LAPTOP BAG 890.NS.: $21,987.00
4. ATTICUS BACKPACK 990.NS.: $21,638.00
5. CORBAN 990.L: $18,795.00

#### Alert Summary
- **Total Alerts Generated**: 10,657
- **Low Stock Alerts**: Items with ≤ 50 units
- **Critical Stock Alerts**: Items with ≤ 10 units
- **Reorder Alerts**: Items below tier thresholds

## Configuration

### ETL Configuration (`etl/config/etl_config.json`)

```json
{
  "location_codes": ["100.0", "103.0", "105.0", ...],
  "tier_thresholds": {
    "best_sellers": 500,
    "doing_good": 300,
    "making_progress": 200,
    "okay": 100
  },
  "alert_thresholds": {
    "low_stock_threshold": 50,
    "critical_stock_threshold": 10,
    "reorder_buffer": 20
  }
}
```

### Key Settings

- **Location Codes**: 17 warehouse locations for inventory tracking
- **Tier Thresholds**: Reorder quantities based on performance tier
- **Alert Thresholds**: Stock level triggers for notifications
- **Processing**: Batch size, workers, retry attempts
- **Output**: CSV, JSON, database export options
- **Email Alerts**: SMTP configuration for notifications

## Output Files

### Processed Data
- **CSV Format**: `etl/data/processed/inventory_YYYYMMDD_HHMMSS.csv`
- **JSON Format**: `etl/data/processed/inventory_YYYYMMDD_HHMMSS.json`

### Alert Reports
- **Alert Data**: `etl/data/alerts/alerts_YYYYMMDD_HHMMSS.json`

### Log Files
- **Processing Logs**: `etl/inventory_etl.log`

## Database Schema

The ETL pipeline is designed to work with the following database schema:

### Inventory Items Table
```sql
CREATE TABLE inventory_items (
    id SERIAL PRIMARY KEY,
    product_group_code VARCHAR(50),
    style VARCHAR(100),
    item_number VARCHAR(50),
    season_code VARCHAR(20),
    description TEXT,
    variant_color VARCHAR(50),
    variant_code VARCHAR(20),
    barcode VARCHAR(50),
    selling_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Inventory State Table
```sql
CREATE TABLE inventory_state (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id),
    location_code VARCHAR(50),
    quantity_on_hand INTEGER,
    reorder_threshold INTEGER,
    tier_category VARCHAR(20),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sales History Table
```sql
CREATE TABLE sales_history (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES inventory_items(id),
    date DATE,
    quantity_sold INTEGER,
    location_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Usage

### Running the ETL Pipeline

```bash
# Navigate to the project directory
cd Inventory_Monitoring_Enterprise

# Activate virtual environment
source ../venv/bin/activate

# Run the ETL pipeline
python etl/scripts/inventory_etl.py
```

### Automated Processing

The ETL pipeline can be scheduled to run automatically:

```bash
# Daily processing at 2 AM
0 2 * * * cd /path/to/Inventory_Monitoring_Enterprise && python etl/scripts/inventory_etl.py
```

## Monitoring and Alerts

### Alert Types
1. **Low Stock Alerts**: Immediate notification when items go below 50 units
2. **Critical Stock Alerts**: Urgent notification when items go below 10 units
3. **Reorder Alerts**: Notification when items fall below tier-specific thresholds
4. **Daily Digest**: Consolidated morning report of all events

### Alert Channels
- **Email**: SMTP-based email notifications
- **Dashboard**: Real-time alert display in web interface
- **Logs**: Structured logging for monitoring and debugging

## Data Quality

### Validation Rules
- Essential columns must not be null (Style, Item No_, Variant Code)
- Numeric columns are validated and converted
- Text columns are cleaned and normalized
- Missing values are handled appropriately

### Error Handling
- Graceful handling of missing files
- Retry logic for processing failures
- Comprehensive logging for debugging
- Alert notifications for system issues

## Performance

### Processing Statistics
- **Processing Time**: ~2-3 seconds for 4,000+ items
- **Memory Usage**: Optimized for large datasets
- **Output Size**: ~3MB JSON, ~850KB CSV
- **Alert Generation**: 10,000+ alerts in <1 second

### Scalability
- **Batch Processing**: Configurable batch sizes
- **Parallel Processing**: Multi-worker support
- **Memory Management**: Efficient data handling
- **Database Integration**: Optimized for large datasets

## Future Enhancements

### Planned Improvements
1. **Real-time Processing**: Stream processing for live updates
2. **Advanced Analytics**: Machine learning for demand forecasting
3. **Integration**: Direct NAV system integration
4. **Mobile Alerts**: Push notifications for critical alerts
5. **Advanced Reporting**: Custom dashboard and reporting tools

### Data Enrichment
1. **Sales Velocity**: Historical sales data for better forecasting
2. **Seasonal Patterns**: Seasonal demand analysis
3. **Supplier Integration**: Automatic reorder processing
4. **Cost Analysis**: Profit margin and cost tracking

## Conclusion

The Excel file analysis reveals a comprehensive inventory management system with detailed product information across multiple warehouse locations. The ETL pipeline successfully processes this data to provide:

- **Real-time inventory tracking** across 17 locations
- **Intelligent tier-based categorization** for optimal reorder management
- **Automated alerting** for low stock and reorder needs
- **Comprehensive reporting** for business intelligence

The system is designed to handle the daily processing of NAV sales exports and provide actionable insights for inventory management decisions. 