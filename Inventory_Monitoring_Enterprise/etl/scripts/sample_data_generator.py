#!/usr/bin/env python3
"""
Sample Data Generator for Inventory Monitoring Enterprise
Creates realistic inventory data for testing the complete system
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta
from pathlib import Path
import json

class SampleDataGenerator:
    """Generate realistic sample inventory data"""
    
    def __init__(self):
        self.styles = [
            "AERYN", "AGGIE", "ALEKSIA", "ALIE", "ALYSON", "ANNIKA", "AZARIA", "BRENNA", "BRETTA",
            "CAMDEN", "CORBAN", "DONNA", "EDITH", "ELIAM", "GILLES", "HADY", "HARPER", "HAYDEN",
            "HINISHA", "JULIETTE", "KEYSI", "MAGALIE", "MARIAM", "MONACO", "WILLOWBY", "ATTICUS"
        ]
        
        self.colors = [
            "BLACK", "DUSK", "EGGPLANT", "CAMEL", "DARK TAUPE", "RED", "TAUPE", "SAND", 
            "ELEMENTAL BLUE", "TEAL", "LATTE", "SAGE", "SKY BLUE", "CHESTNUT", "LIGHT GREY",
            "DARK NAVY", "MINK", "BRITISH TAN", "RADIANT RED", "BORDEAUX", "OLIVE", "CARAMEL"
        ]
        
        self.sizes = [
            "990.XS", "990.S", "990.M", "990.L", "990.XL", "990.2XL", "990.NS",
            "549.2XS", "549.XS", "549.S", "549.M", "549.L", "549.XL", "549.2XL",
            "730.2XS", "730.XS", "730.S", "730.M", "730.L", "730.XL", "730.NS",
            "440NS", "620.NS", "660.NS", "847.NS", "918.NS"
        ]
        
        self.categories = {
            "WOMEN'S LEATHER JACKETS": ["MONACO", "AERYN", "ALEKSIA", "ALYSON"],
            "WOMEN'S HANDBAGS": ["MARIAM", "EDITH", "WILLOWBY", "HARPER", "HADY"],
            "MEN'S LAPTOP BAGS": ["ELIAM", "GILLES", "ATTICUS"],
            "WOMEN'S COATS": ["AGGIE", "ALIE", "ANNIKA", "AZARIA", "BRENNA", "BRETTA"],
            "WALLETS & ACCESSORIES": ["KEYSI", "ABERDEEN", "ADVENTURE SEEKER"]
        }
        
        self.location_codes = ["100.0", "103.0", "105.0", "106.0", "108.0", "109.0", 
                              "113.0", "114.0", "116.0", "117.0", "201.0", "251.0", 
                              "301.0", "302.0", "401.0", "501.0", "551.0"]
        
        self.seasons = ["FA25", "SP25", "SP24", "FA26", "KI00", "FA24", "ALL SEASON"]
        
    def generate_product_data(self, num_products=1000):
        """Generate realistic product data"""
        products = []
        
        for i in range(num_products):
            # Determine product category and style
            category = random.choice(list(self.categories.keys()))
            style = random.choice(self.categories[category])
            color = random.choice(self.colors)
            size = random.choice(self.sizes)
            season = random.choice(self.seasons)
            
            # Generate item number
            item_number = f"{random.randint(100000, 999999)}"
            
            # Generate description
            description = f"{style} - {category.replace('_', ' ')} IN {color}"
            
            # Generate barcode
            barcode = f"{random.randint(1000000000000, 9999999999999)}"
            
            # Generate realistic price based on category
            if "JACKET" in category:
                base_price = random.uniform(400, 800)
            elif "HANDBAG" in category:
                base_price = random.uniform(150, 300)
            elif "LAPTOP" in category:
                base_price = random.uniform(200, 400)
            elif "COAT" in category:
                base_price = random.uniform(300, 600)
            else:
                base_price = random.uniform(50, 200)
            
            price = round(base_price, 2)
            
            # Generate inventory quantities across locations
            location_quantities = {}
            for location in self.location_codes:
                # Some locations have more inventory than others
                if location in ["100.0", "103.0"]:  # Main warehouses
                    quantity = random.randint(0, 100)
                elif location in ["105.0", "106.0", "108.0", "109.0"]:  # Secondary warehouses
                    quantity = random.randint(0, 50)
                else:  # Other locations
                    quantity = random.randint(0, 25)
                
                location_quantities[location] = quantity
            
            # Calculate total quantity
            total_quantity = sum(location_quantities.values())
            
            # Generate product group code
            product_group = f"{random.randint(10, 99)}-{random.randint(10, 99)}-{random.randint(10, 99)}"
            
            product = {
                'Item Product Group Code': product_group,
                'Style': style,
                'Item No_': item_number,
                'Season Code': season,
                'Item Description': description,
                'Variant Color': color,
                'Variant Code': size,
                'Item Barcode': barcode,
                'Selling Price': price,
                'Location Code': location_quantities.get('100.0', 0),
                **location_quantities,
                'TRUCK': random.randint(0, 5),
                'Grand Total': total_quantity
            }
            
            products.append(product)
        
        return products
    
    def create_sample_excel(self, output_file="sample_inventory_report.xlsx", num_products=1000):
        """Create a sample Excel file with realistic inventory data"""
        print(f"Generating {num_products} sample products...")
        
        # Generate product data
        products = self.generate_product_data(num_products)
        
        # Create DataFrame
        df = pd.DataFrame(products)
        
        # Add header row (like the original Excel file)
        header_row = pd.DataFrame([{
            'Item Product Group Code': 'Item Product Group Code',
            'Style': 'Style',
            'Item No_': 'Item No_',
            'Season Code': 'Season Code',
            'Item Description': 'Item Description',
            'Variant Color': 'Variant Color',
            'Variant Code': 'Variant Code',
            'Item Barcode': 'Item Barcode',
            'Selling Price': 'Selling Price',
            'Location Code': 'Location Code',
            **{loc: loc for loc in self.location_codes},
            'TRUCK': 'TRUCK',
            'Grand Total': 'Grand Total'
        }])
        
        # Combine header and data
        final_df = pd.concat([header_row, df], ignore_index=True)
        
        # Save to Excel
        final_df.to_excel(output_file, index=False, sheet_name='Sheet1')
        
        print(f"Sample Excel file created: {output_file}")
        print(f"Total products: {len(products)}")
        print(f"Total value: ${(df['Selling Price'] * df['Grand Total']).sum():,.2f}")
        
        return output_file
    
    def create_test_scenarios(self):
        """Create specific test scenarios for different alert types"""
        scenarios = {
            "critical_stock": [],
            "low_stock": [],
            "best_sellers": [],
            "normal_stock": []
        }
        
        # Critical stock items (0-10 units)
        for i in range(50):
            product = self.generate_product_data(1)[0]
            product['Grand Total'] = random.randint(0, 10)
            product['Location Code'] = product['Grand Total']
            scenarios["critical_stock"].append(product)
        
        # Low stock items (11-50 units)
        for i in range(100):
            product = self.generate_product_data(1)[0]
            product['Grand Total'] = random.randint(11, 50)
            product['Location Code'] = product['Grand Total']
            scenarios["low_stock"].append(product)
        
        # Best sellers (high value items)
        for i in range(50):
            product = self.generate_product_data(1)[0]
            product['Selling Price'] = random.uniform(500, 1000)
            product['Grand Total'] = random.randint(100, 500)
            product['Location Code'] = product['Grand Total']
            scenarios["best_sellers"].append(product)
        
        # Normal stock items
        for i in range(200):
            product = self.generate_product_data(1)[0]
            product['Grand Total'] = random.randint(51, 200)
            product['Location Code'] = product['Grand Total']
            scenarios["normal_stock"].append(product)
        
        return scenarios
    
    def create_test_excel_files(self):
        """Create multiple test Excel files for different scenarios"""
        test_files = {}
        
        # Create main test file
        main_file = self.create_sample_excel("test_inventory_main.xlsx", 1000)
        test_files["main"] = main_file
        
        # Create critical stock test file
        scenarios = self.create_test_scenarios()
        critical_df = pd.DataFrame(scenarios["critical_stock"])
        critical_df.to_excel("test_inventory_critical.xlsx", index=False)
        test_files["critical"] = "test_inventory_critical.xlsx"
        
        # Create low stock test file
        low_stock_df = pd.DataFrame(scenarios["low_stock"])
        low_stock_df.to_excel("test_inventory_low_stock.xlsx", index=False)
        test_files["low_stock"] = "test_inventory_low_stock.xlsx"
        
        # Create best sellers test file
        best_sellers_df = pd.DataFrame(scenarios["best_sellers"])
        best_sellers_df.to_excel("test_inventory_best_sellers.xlsx", index=False)
        test_files["best_sellers"] = "test_inventory_best_sellers.xlsx"
        
        return test_files

def main():
    """Main function to generate sample data"""
    print("Sample Data Generator for Inventory Monitoring Enterprise")
    print("=" * 60)
    
    generator = SampleDataGenerator()
    
    # Create test files
    test_files = generator.create_test_excel_files()
    
    print("\nTest files created:")
    for scenario, filename in test_files.items():
        print(f"  {scenario}: {filename}")
    
    print("\nYou can now use these files to test the ETL pipeline:")
    print("1. test_inventory_main.xlsx - General testing")
    print("2. test_inventory_critical.xlsx - Critical stock alerts")
    print("3. test_inventory_low_stock.xlsx - Low stock alerts")
    print("4. test_inventory_best_sellers.xlsx - Best sellers testing")
    
    print("\nTo test the ETL pipeline:")
    print("python etl/scripts/inventory_etl.py")

if __name__ == "__main__":
    main() 