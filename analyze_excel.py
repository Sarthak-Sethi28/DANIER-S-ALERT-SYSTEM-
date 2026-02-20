#!/usr/bin/env python3
"""
Excel File Analyzer for Inventory Monitoring Enterprise
Analyzes the structure of the NAV sales export Excel file
"""

import pandas as pd
import numpy as np
from pathlib import Path
import sys

def analyze_excel_file(file_path):
    """Analyze the structure and content of the Excel file"""
    
    print(f"Analyzing Excel file: {file_path}")
    print("=" * 60)
    
    try:
        # Read all sheets in the Excel file
        excel_file = pd.ExcelFile(file_path)
        print(f"Number of sheets: {len(excel_file.sheet_names)}")
        print(f"Sheet names: {excel_file.sheet_names}")
        print()
        
        # Analyze each sheet
        for sheet_name in excel_file.sheet_names:
            print(f"Sheet: {sheet_name}")
            print("-" * 40)
            
            # Read the sheet
            df = pd.read_excel(file_path, sheet_name=sheet_name)
            
            # Basic info
            print(f"Shape: {df.shape} (rows, columns)")
            print(f"Columns: {list(df.columns)}")
            print()
            
            # Data types
            print("Data types:")
            for col, dtype in df.dtypes.items():
                print(f"  {col}: {dtype}")
            print()
            
            # Sample data (first 5 rows)
            print("Sample data (first 5 rows):")
            print(df.head())
            print()
            
            # Check for missing values
            missing_values = df.isnull().sum()
            if missing_values.sum() > 0:
                print("Missing values:")
                for col, missing in missing_values.items():
                    if missing > 0:
                        print(f"  {col}: {missing} missing values")
                print()
            
            # Basic statistics for numeric columns
            numeric_cols = df.select_dtypes(include=[np.number]).columns
            if len(numeric_cols) > 0:
                print("Numeric columns statistics:")
                print(df[numeric_cols].describe())
                print()
            
            # Unique values for categorical columns (first 10)
            categorical_cols = df.select_dtypes(include=['object']).columns
            if len(categorical_cols) > 0:
                print("Categorical columns unique values (first 10):")
                for col in categorical_cols:
                    unique_vals = df[col].dropna().unique()
                    print(f"  {col}: {unique_vals[:10]}")
                print()
            
            print("=" * 60)
            print()
    
    except Exception as e:
        print(f"Error analyzing Excel file: {e}")
        return False
    
    return True

def main():
    """Main function"""
    excel_file = "Inventory Report -July 07,2025 (1).xlsx"
    
    if not Path(excel_file).exists():
        print(f"Error: File '{excel_file}' not found!")
        print("Please ensure the Excel file is in the current directory.")
        return
    
    success = analyze_excel_file(excel_file)
    
    if success:
        print("Excel file analysis completed successfully!")
        print("\nNext steps:")
        print("1. Review the column structure above")
        print("2. Identify key columns for inventory tracking")
        print("3. Map columns to database schema")
        print("4. Create ETL pipeline to process this data")
    else:
        print("Excel file analysis failed!")

if __name__ == "__main__":
    main() 