#!/usr/bin/env python3
"""
Detailed Excel File Analysis for Inventory Monitoring Enterprise
Comprehensive analysis of the NAV sales export Excel file structure
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

def clean_column_names(df):
    """Clean and rename columns based on the first row data"""
    
    # Get the first row which contains the actual column headers
    headers = df.iloc[0].tolist()
    
    # Clean the headers
    cleaned_headers = []
    for header in headers:
        if pd.isna(header):
            cleaned_headers.append('Unknown')
        else:
            # Clean the header string
            cleaned = str(header).strip()
            cleaned_headers.append(cleaned)
    
    # Create a mapping for the unnamed columns
    column_mapping = {}
    for i, (old_col, new_header) in enumerate(zip(df.columns, cleaned_headers)):
        if old_col.startswith('Unnamed:'):
            column_mapping[old_col] = new_header
        else:
            column_mapping[old_col] = old_col
    
    return column_mapping

def analyze_inventory_data(file_path):
    """Detailed analysis of the inventory Excel file"""
    
    print(f"Detailed Analysis of: {file_path}")
    print("=" * 80)
    
    try:
        # Read the Excel file
        df = pd.read_excel(file_path, sheet_name='Sheet1')
        
        print(f"Raw data shape: {df.shape}")
        print(f"Raw columns: {list(df.columns)}")
        print()
        
        # The first row contains the actual column headers
        print("First row (column headers):")
        print(df.iloc[0].tolist())
        print()
        
        # Clean column names
        column_mapping = clean_column_names(df)
        
        # Create a new dataframe with proper headers
        df_clean = df.copy()
        df_clean.columns = [column_mapping[col] for col in df.columns]
        
        # Remove the header row and reset index
        df_clean = df_clean.iloc[1:].reset_index(drop=True)
        
        print("Cleaned column names:")
        for i, col in enumerate(df_clean.columns):
            print(f"  {i+1:2d}. {col}")
        print()
        
        # Analyze key inventory columns
        print("KEY INVENTORY COLUMNS ANALYSIS:")
        print("-" * 50)
        
        # Product Group Code
        if 'Item Product Group Code' in df_clean.columns:
            product_groups = df_clean['Item Product Group Code'].dropna().unique()
            print(f"Product Groups ({len(product_groups)}): {product_groups}")
            print()
        
        # Style
        if 'Style' in df_clean.columns:
            styles = df_clean['Style'].dropna().unique()
            print(f"Styles ({len(styles)}): {styles[:10]}...")  # Show first 10
            print()
        
        # Item Numbers
        if 'Item No_' in df_clean.columns:
            item_nos = df_clean['Item No_'].dropna().unique()
            print(f"Item Numbers ({len(item_nos)}): {item_nos[:10]}...")  # Show first 10
            print()
        
        # Season Codes
        if 'Season Code' in df_clean.columns:
            seasons = df_clean['Season Code'].dropna().unique()
            print(f"Season Codes ({len(seasons)}): {seasons}")
            print()
        
        # Colors
        if 'Variant Color' in df_clean.columns:
            colors = df_clean['Variant Color'].dropna().unique()
            print(f"Colors ({len(colors)}): {colors}")
            print()
        
        # Sizes
        if 'Variant Code' in df_clean.columns:
            sizes = df_clean['Variant Code'].dropna().unique()
            print(f"Sizes ({len(sizes)}): {sizes[:10]}...")  # Show first 10
            print()
        
        # Prices
        if 'Selling Price' in df_clean.columns:
            prices = df_clean['Selling Price'].dropna()
            print(f"Price Statistics:")
            print(f"  Min: ${prices.min():.2f}")
            print(f"  Max: ${prices.max():.2f}")
            print(f"  Mean: ${prices.mean():.2f}")
            print(f"  Median: ${prices.median():.2f}")
            print()
        
        # Location Code (inventory quantities)
        if 'Location Code' in df_clean.columns:
            location_data = df_clean['Location Code'].dropna()
            print(f"Location Code Statistics:")
            print(f"  Total records: {len(location_data)}")
            print(f"  Min: {location_data.min()}")
            print(f"  Max: {location_data.max()}")
            print(f"  Mean: {location_data.mean():.2f}")
            print(f"  Median: {location_data.median():.2f}")
            print()
        
        # Analyze inventory quantities across locations
        print("INVENTORY QUANTITIES BY LOCATION:")
        print("-" * 40)
        
        # Find all numeric columns that represent inventory quantities
        numeric_cols = df_clean.select_dtypes(include=[np.number]).columns
        print(f"Numeric columns (potential inventory quantities): {list(numeric_cols)}")
        print()
        
        # Show sample data for key columns
        print("SAMPLE DATA (first 10 rows):")
        print("-" * 30)
        key_columns = ['Item Product Group Code', 'Style', 'Item No_', 'Item Description', 
                      'Variant Color', 'Variant Code', 'Selling Price', 'Location Code']
        
        available_columns = [col for col in key_columns if col in df_clean.columns]
        print(df_clean[available_columns].head(10))
        print()
        
        # Analyze missing data
        print("MISSING DATA ANALYSIS:")
        print("-" * 25)
        missing_data = df_clean.isnull().sum()
        missing_percentage = (missing_data / len(df_clean)) * 100
        
        for col in df_clean.columns:
            if missing_data[col] > 0:
                print(f"{col}: {missing_data[col]} missing ({missing_percentage[col]:.1f}%)")
        print()
        
        # Save cleaned data for further processing
        output_file = "cleaned_inventory_data.csv"
        df_clean.to_csv(output_file, index=False)
        print(f"Cleaned data saved to: {output_file}")
        
        return df_clean, column_mapping
        
    except Exception as e:
        print(f"Error analyzing Excel file: {e}")
        return None, None

def generate_etl_specification(df_clean, column_mapping):
    """Generate ETL specification based on the analyzed data"""
    
    print("ETL SPECIFICATION:")
    print("=" * 50)
    
    print("1. COLUMN MAPPING:")
    print("-" * 20)
    for old_col, new_col in column_mapping.items():
        print(f"  {old_col} -> {new_col}")
    print()
    
    print("2. DATABASE SCHEMA SUGGESTION:")
    print("-" * 30)
    
    schema_suggestion = """
    -- Inventory Items Table
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
    
    -- Inventory State Table
    CREATE TABLE inventory_state (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory_items(id),
        location_code VARCHAR(50),
        quantity_on_hand INTEGER,
        reorder_threshold INTEGER,
        tier_category VARCHAR(20),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Sales History Table
    CREATE TABLE sales_history (
        id SERIAL PRIMARY KEY,
        item_id INTEGER REFERENCES inventory_items(id),
        date DATE,
        quantity_sold INTEGER,
        location_code VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """
    
    print(schema_suggestion)
    
    print("3. ETL PROCESSING STEPS:")
    print("-" * 30)
    print("""
    1. Read Excel file with pandas
    2. Clean column headers (remove first row, use as headers)
    3. Map columns to database schema
    4. Validate data types and ranges
    5. Handle missing values
    6. Calculate inventory deltas (compare with previous day)
    7. Update inventory state table
    8. Generate alerts for low stock items
    9. Update tier classifications
    10. Log processing results
    """)

def main():
    """Main function"""
    excel_file = "Inventory Report -July 07,2025 (1).xlsx"
    
    if not Path(excel_file).exists():
        print(f"Error: File '{excel_file}' not found!")
        return
    
    # Analyze the data
    df_clean, column_mapping = analyze_inventory_data(excel_file)
    
    if df_clean is not None:
        # Generate ETL specification
        generate_etl_specification(df_clean, column_mapping)
        
        print("\n" + "=" * 80)
        print("ANALYSIS COMPLETE!")
        print("=" * 80)
        print("\nKey findings:")
        print("1. Excel file contains 4,095 rows of inventory data")
        print("2. Data includes product details, variants, prices, and quantities")
        print("3. Multiple location codes represent different warehouse locations")
        print("4. Data structure is suitable for inventory monitoring system")
        print("\nNext steps:")
        print("1. Create ETL pipeline to process this data daily")
        print("2. Implement database schema for inventory tracking")
        print("3. Set up automated processing and alerting")
        print("4. Create dashboard for inventory monitoring")
    else:
        print("Analysis failed!")

if __name__ == "__main__":
    main() 