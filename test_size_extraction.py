#!/usr/bin/env python3
"""
Test script to verify size extraction is working correctly
"""

import sys
import os
sys.path.append('backend')

from key_items_service import KeyItemsService
import pandas as pd

def test_size_extraction():
    """Test size extraction with various variant codes"""
    service = KeyItemsService()
    
    # Test BOWEN variant codes (the problematic ones)
    bowen_codes = [
        '350XS', '350S', '350M', '350L', '350XL', '3502XL',
        '670XS', '670S', '670M', '670L', '670XL', '6702XL',
        '669.XS', '669.S', '669.M', '669.L', '669.XL', '669.2XL'
    ]
    
    print("Testing BOWEN variant codes:")
    for code in bowen_codes:
        size = service.extract_size_from_variant(code)
        print(f"  {code} -> {size}")
    
    # Test other problematic patterns
    other_codes = [
        '990.3XS', '990.2XS', '990.XS', '990.S', '990.M', '990.L', '990.XL', '990.2XL',
        '990L', '990M', '990S', '990XL', '9902XL',
        '113NS', '990.NS', '990.26', '99026'
    ]
    
    print("\nTesting other variant codes:")
    for code in other_codes:
        size = service.extract_size_from_variant(code)
        print(f"  {code} -> {size}")
    
    # Test with real data from file
    print("\nTesting with real data from inventory file:")
    try:
        df = pd.read_excel('backend/uploads/inventory_20250808_133551.xlsx')
        ki00 = df[df['Season Code'] == 'KI00']
        
        # Get BOWEN items
        bowen_items = ki00[ki00['Item Description'].str.contains('BOWEN', na=False)]
        
        print(f"Found {len(bowen_items)} BOWEN items:")
        for _, row in bowen_items.iterrows():
            variant_code = row['Variant Code']
            color = row['Variant Color']
            extracted_size = service.extract_size_from_variant(variant_code)
            print(f"  {variant_code} ({color}) -> {extracted_size}")
            
    except Exception as e:
        print(f"Error reading file: {e}")

if __name__ == "__main__":
    test_size_extraction() 