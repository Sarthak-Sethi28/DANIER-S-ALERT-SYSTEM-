#!/usr/bin/env python3
"""
Inventory ETL Pipeline for Inventory Monitoring Enterprise
Processes Excel files and generates intelligent alerts and reports
"""

import pandas as pd
import numpy as np
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

class InventoryETL:
    """Intelligent Inventory ETL Pipeline with Business Rules"""
    
    def __init__(self, config_file="etl/config/etl_config.json"):
        self.config = self.load_config(config_file)
        self.setup_logging()
        self.alerts = []
        self.processed_data = []
        
    def load_config(self, config_file):
        """Load configuration from JSON file"""
        try:
            with open(config_file, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.get_default_config()
    
    def get_default_config(self):
        """Get default configuration with intelligent business rules"""
        return {
            "location_codes": ["100.0", "103.0", "105.0", "106.0", "108.0", "109.0", 
                              "113.0", "114.0", "116.0", "117.0", "201.0", "251.0", 
                              "301.0", "302.0", "401.0", "501.0", "551.0"],
            "tier_thresholds": {
                "best_sellers": {
                    "min_value": 50000,
                    "reorder_quantity": 500,
                    "description": "Top 10% performers - High demand items"
                },
                "doing_good": {
                    "min_value": 25000,
                    "reorder_quantity": 300,
                    "description": "Next 20% - Steady performers"
                },
                "making_progress": {
                    "min_value": 10000,
                    "reorder_quantity": 200,
                    "description": "Next 30% - Growing items"
                },
                "okay": {
                    "min_value": 0,
                    "reorder_quantity": 100,
                    "description": "Bottom 40% - Standard items"
                }
            },
            "alert_thresholds": {
                "low_stock_threshold": 50,
                "critical_stock_threshold": 10,
                "reorder_buffer": 20,
                "out_of_stock_threshold": 0
            },
            "business_rules": {
                "seasonal_adjustments": {
                    "spring": {"multiplier": 1.2, "months": [3, 4, 5]},
                    "summer": {"multiplier": 1.1, "months": [6, 7, 8]},
                    "fall": {"multiplier": 1.3, "months": [9, 10, 11]},
                    "winter": {"multiplier": 1.0, "months": [12, 1, 2]}
                },
                "category_multipliers": {
                    "WOMEN'S LEATHER JACKETS": 1.5,
                    "WOMEN'S HANDBAGS": 1.3,
                    "MEN'S LAPTOP BAGS": 1.2,
                    "WOMEN'S COATS": 1.4,
                    "WALLETS & ACCESSORIES": 1.0
                },
                "location_priorities": {
                    "100.0": 1.0, "103.0": 1.0, "105.0": 0.8, "106.0": 0.8,
                    "108.0": 0.8, "109.0": 0.8, "113.0": 0.6, "114.0": 0.6,
                    "116.0": 0.6, "117.0": 0.6, "201.0": 0.7, "251.0": 0.7,
                    "301.0": 0.5, "302.0": 0.5, "401.0": 0.5, "501.0": 0.5, "551.0": 0.5
                }
            }
        }
    
    def setup_logging(self):
        """Setup logging configuration"""
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler('etl/logs/etl.log'),
                logging.StreamHandler()
            ]
        )
        self.logger = logging.getLogger(__name__)
    
    def determine_product_category(self, item):
        """Intelligently determine product category based on style and description"""
        style = str(item.get('Style', '')).upper()
        description = str(item.get('Item Description', '')).upper()
        
        if any(keyword in style or keyword in description for keyword in ['JACKET', 'BLAZER']):
            return "WOMEN'S LEATHER JACKETS"
        elif any(keyword in style or keyword in description for keyword in ['BAG', 'SATCHEL', 'CROSSBODY']):
            if any(keyword in style or keyword in description for keyword in ['LAPTOP', 'COMPUTER']):
                return "MEN'S LAPTOP BAGS"
            else:
                return "WOMEN'S HANDBAGS"
        elif any(keyword in style or keyword in description for keyword in ['COAT', 'TRENCH']):
            return "WOMEN'S COATS"
        elif any(keyword in style or keyword in description for keyword in ['WALLET', 'ACCESSORY']):
            return "WALLETS & ACCESSORIES"
        else:
            return "WOMEN'S HANDBAGS"  # Default category
    
    def calculate_seasonal_multiplier(self):
        """Calculate seasonal adjustment multiplier"""
        current_month = datetime.now().month
        seasonal_rules = self.config.get('business_rules', {}).get('seasonal_adjustments', {})
        
        for season, rule in seasonal_rules.items():
            if current_month in rule['months']:
                return rule['multiplier']
        return 1.0
    
    def calculate_intelligent_reorder_quantity(self, item, tier, base_quantity):
        """Calculate intelligent reorder quantity based on business rules"""
        # Get base reorder quantity for tier
        tier_config = self.config['tier_thresholds'][tier]
        base_reorder = tier_config['reorder_quantity']
        
        # Apply category multiplier
        category = self.determine_product_category(item)
        category_multipliers = self.config.get('business_rules', {}).get('category_multipliers', {})
        category_multiplier = category_multipliers.get(category, 1.0)
        
        # Apply seasonal adjustment
        seasonal_multiplier = self.calculate_seasonal_multiplier()
        
        # Apply current stock level adjustment
        current_stock = item.get('total_quantity', 0)
        stock_adjustment = 1.0
        if current_stock < 10:
            stock_adjustment = 1.5  # Increase reorder for very low stock
        elif current_stock > 200:
            stock_adjustment = 0.8  # Reduce reorder for high stock
        
        # Calculate final reorder quantity
        final_quantity = int(base_reorder * category_multiplier * seasonal_multiplier * stock_adjustment)
        
        # Ensure minimum reorder quantity
        min_reorder = max(50, base_reorder // 2)
        final_quantity = max(min_reorder, final_quantity)
        
        return final_quantity
    
    def categorize_items_by_performance(self, items):
        """Categorize items into performance tiers based on total value"""
        # Calculate total value for each item
        for item in items:
            total_quantity = item.get('total_quantity', 0)
            selling_price = item.get('Selling Price', 0)
            item['total_value'] = total_quantity * selling_price
        
        # Sort by total value (descending)
        sorted_items = sorted(items, key=lambda x: x.get('total_value', 0), reverse=True)
        
        # Categorize based on value thresholds
        categorized_items = []
        for item in sorted_items:
            total_value = item.get('total_value', 0)
            
            if total_value >= self.config['tier_thresholds']['best_sellers']['min_value']:
                tier = 'best_sellers'
            elif total_value >= self.config['tier_thresholds']['doing_good']['min_value']:
                tier = 'doing_good'
            elif total_value >= self.config['tier_thresholds']['making_progress']['min_value']:
                tier = 'making_progress'
            else:
                tier = 'okay'
            
            # Calculate intelligent reorder quantity
            base_reorder = self.config['tier_thresholds'][tier]['reorder_quantity']
            intelligent_reorder = self.calculate_intelligent_reorder_quantity(item, tier, base_reorder)
            
            item['tier'] = tier
            item['reorder_quantity'] = intelligent_reorder
            item['tier_description'] = self.config['tier_thresholds'][tier]['description']
            
            categorized_items.append(item)
        
        return categorized_items
    
    def generate_intelligent_alerts(self, items):
        """Generate intelligent alerts based on business rules"""
        alerts = []
        
        for item in items:
            total_quantity = item.get('total_quantity', 0)
            tier = item.get('tier', 'okay')
            reorder_quantity = item.get('reorder_quantity', 100)
            
            # Critical stock alert
            if total_quantity <= self.config['alert_thresholds']['critical_stock_threshold']:
                alerts.append({
                    'type': 'critical_stock',
                    'severity': 'critical',
                    'item': item,
                    'message': f"CRITICAL: {item['Style']} {item['Variant Code']} has only {total_quantity} units remaining!",
                    'recommended_action': f"Immediate reorder of {reorder_quantity} units recommended."
                })
            
            # Low stock alert
            elif total_quantity <= self.config['alert_thresholds']['low_stock_threshold']:
                alerts.append({
                    'type': 'low_stock',
                    'severity': 'warning',
                    'item': item,
                    'message': f"LOW STOCK: {item['Style']} {item['Variant Code']} has {total_quantity} units remaining.",
                    'recommended_action': f"Consider reordering {reorder_quantity} units."
                })
            
            # Reorder alert based on tier
            if total_quantity <= reorder_quantity:
                alerts.append({
                    'type': 'reorder',
                    'severity': 'info',
                    'item': item,
                    'message': f"REORDER: {item['Style']} {item['Variant Code']} ({tier.upper()}) needs reorder.",
                    'recommended_action': f"Reorder {reorder_quantity} units based on {tier} tier analysis."
                })
        
        return alerts
    
    def process_excel_file(self, file_path):
        """Process Excel file with intelligent business logic"""
        try:
            self.logger.info(f"Processing Excel file: {file_path}")
            
            # Read Excel file
            df = pd.read_excel(file_path, sheet_name='Sheet1')
            
            # Check if first row contains headers (like original file)
            first_row = df.iloc[0].tolist()
            if any('Item Product Group Code' in str(cell) for cell in first_row):
                # Original file structure - use first row as headers
                df.columns = df.iloc[0]
                df = df.iloc[1:].reset_index(drop=True)
            
            # Calculate total quantities across locations
            location_codes = self.config['location_codes']
            available_locations = [loc for loc in location_codes if loc in df.columns]
            
            # Convert location columns to numeric
            for loc in available_locations:
                df[loc] = pd.to_numeric(df[loc], errors='coerce').fillna(0)
            
            # Calculate grand total
            if available_locations:
                df['total_quantity'] = df[available_locations].sum(axis=1)
            else:
                # Fallback to Grand Total column if available
                if 'Grand Total' in df.columns:
                    df['total_quantity'] = pd.to_numeric(df['Grand Total'], errors='coerce').fillna(0)
                else:
                    df['total_quantity'] = 0
            
            # Convert to list of dictionaries
            items = df.to_dict('records')
            
            # Categorize items by performance
            categorized_items = self.categorize_items_by_performance(items)
            
            # Generate alerts
            alerts = self.generate_intelligent_alerts(categorized_items)
            
            # Store results
            self.processed_data = categorized_items
            self.alerts = alerts
            
            # Generate reports
            self.generate_reports()
            
            # Send email alerts
            if self.config.get('email_alerts', {}).get('enabled', False):
                self.send_email_alerts()
            
            self.logger.info(f"Processing completed: {len(items)} items, {len(alerts)} alerts generated")
            return True
            
        except Exception as e:
            self.logger.error(f"Error processing Excel file: {e}")
            return False
    
    def generate_reports(self):
        """Generate comprehensive business intelligence reports"""
        if not self.processed_data:
            return
        
        # Summary statistics
        total_items = len(self.processed_data)
        total_value = sum(item.get('total_value', 0) for item in self.processed_data)
        total_quantity = sum(item.get('total_quantity', 0) for item in self.processed_data)
        
        # Tier distribution
        tier_counts = {}
        tier_values = {}
        for item in self.processed_data:
            tier = item.get('tier', 'okay')
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
            tier_values[tier] = tier_values.get(tier, 0) + item.get('total_value', 0)
        
        # Alert summary
        alert_counts = {}
        for alert in self.alerts:
            alert_type = alert['type']
            alert_counts[alert_type] = alert_counts.get(alert_type, 0) + 1
        
        # Generate report
        report = {
            'timestamp': datetime.now().isoformat(),
            'summary': {
                'total_items': total_items,
                'total_value': total_value,
                'total_quantity': total_quantity,
                'average_value_per_item': total_value / total_items if total_items > 0 else 0
            },
            'tier_distribution': tier_counts,
            'tier_values': tier_values,
            'alerts': alert_counts,
            'top_performers': sorted(self.processed_data, key=lambda x: x.get('total_value', 0), reverse=True)[:10],
            'critical_items': [item for item in self.processed_data if item.get('total_quantity', 0) <= 10]
        }
        
        # Save report
        with open('etl/output/business_intelligence_report.json', 'w') as f:
            json.dump(report, f, indent=2, default=str)
        
        self.logger.info(f"Business intelligence report generated: {total_items} items, ${total_value:,.2f} total value")
    
    def send_email_alerts(self):
        """Send intelligent email alerts with recipient management"""
        if not self.alerts:
            return
        
        # Load email recipients configuration
        email_recipients = self.load_email_recipients()
        
        # Group alerts by type
        critical_alerts = [a for a in self.alerts if a['type'] == 'critical_stock']
        low_stock_alerts = [a for a in self.alerts if a['type'] == 'low_stock']
        reorder_alerts = [a for a in self.alerts if a['type'] == 'reorder']
        
        # Send specific alerts to their recipients
        if critical_alerts:
            self.send_alert_email('critical_stock', critical_alerts, email_recipients)
        
        if low_stock_alerts:
            self.send_alert_email('low_stock', low_stock_alerts, email_recipients)
        
        if reorder_alerts:
            self.send_alert_email('reorder', reorder_alerts, email_recipients)
        
        # Send summary to all_alerts recipients
        self.send_summary_email(self.alerts, email_recipients)
    
    def load_email_recipients(self):
        """Load email recipients configuration"""
        try:
            with open('etl/config/email_recipients.json', 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            self.logger.warning("Email recipients config not found, using defaults")
            return {
                "email_recipients": {
                    "critical_stock": ["admin@danier.com"],
                    "low_stock": ["admin@danier.com"],
                    "reorder": ["admin@danier.com"],
                    "all_alerts": ["admin@danier.com"]
                }
            }
    
    def send_alert_email(self, alert_type, alerts, email_config):
        """Send specific alert type email"""
        recipients = email_config["email_recipients"].get(alert_type, [])
        if not recipients:
            self.logger.warning(f"No recipients configured for {alert_type} alerts")
            return
        
        subject = f"[Inventory Alert] {len(alerts)} {alert_type.replace('_', ' ').title()} Alerts"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .alert {{ padding: 15px; margin: 10px 0; border-radius: 5px; }}
                .critical {{ background-color: #ffebee; border-left: 4px solid #f44336; }}
                .warning {{ background-color: #fff3e0; border-left: 4px solid #ff9800; }}
                .info {{ background-color: #e3f2fd; border-left: 4px solid #2196f3; }}
                .item {{ margin: 10px 0; padding: 10px; background-color: #f5f5f5; }}
            </style>
        </head>
        <body>
            <h2>Inventory {alert_type.replace('_', ' ').title()} Alerts</h2>
            <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p>Total alerts: {len(alerts)}</p>
        """
        
        for alert in alerts[:10]:  # Show top 10
            item = alert['item']
            severity_class = alert['severity']
            html_content += f"""
            <div class="alert {severity_class}">
                <strong>{alert['message']}</strong><br>
                <strong>Action:</strong> {alert['recommended_action']}<br>
                <strong>Item:</strong> {item['Style']} {item['Variant Code']} - ${item.get('Selling Price', 0):.2f}<br>
                <strong>Current Stock:</strong> {item.get('total_quantity', 0)} units<br>
                <strong>Tier:</strong> {item.get('tier', 'unknown').replace('_', ' ').title()}
            </div>
            """
        
        html_content += "</body></html>"
        
        # Send email (placeholder - implement actual SMTP)
        self.logger.info(f"Email alert prepared for {alert_type}: {len(alerts)} alerts to {len(recipients)} recipients")
    
    def send_summary_email(self, all_alerts, email_config):
        """Send summary email to all_alerts recipients"""
        recipients = email_config["email_recipients"].get("all_alerts", [])
        if not recipients:
            return
        
        # Group alerts by type
        alert_counts = {}
        for alert in all_alerts:
            alert_type = alert['type']
            alert_counts[alert_type] = alert_counts.get(alert_type, 0) + 1
        
        subject = f"[Inventory Summary] {len(all_alerts)} Total Alerts Generated"
        
        html_content = f"""
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                .summary {{ background-color: #f5f5f5; padding: 20px; border-radius: 5px; }}
                .count {{ font-size: 24px; font-weight: bold; color: #1976d2; }}
            </style>
        </head>
        <body>
            <h2>Inventory Alert Summary</h2>
            <p>Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            
            <div class="summary">
                <h3>Alert Summary</h3>
                <p><span class="count">{len(all_alerts)}</span> total alerts generated</p>
                <ul>
        """
        
        for alert_type, count in alert_counts.items():
            html_content += f"<li>{alert_type.replace('_', ' ').title()}: {count} alerts</li>"
        
        html_content += """
                </ul>
            </div>
        </body>
        </html>
        """
        
        # Send email (placeholder - implement actual SMTP)
        self.logger.info(f"Summary email prepared: {len(all_alerts)} total alerts to {len(recipients)} recipients")
    
    def save_processed_data(self):
        """Save processed data to files"""
        if not self.processed_data:
            return
        
        # Save as CSV
        df = pd.DataFrame(self.processed_data)
        df.to_csv('etl/output/processed_inventory.csv', index=False)
        
        # Save as JSON
        with open('etl/output/processed_inventory.json', 'w') as f:
            json.dump(self.processed_data, f, indent=2, default=str)
        
        # Save alerts
        with open('etl/output/alerts.json', 'w') as f:
            json.dump(self.alerts, f, indent=2, default=str)
        
        self.logger.info(f"Data saved: {len(self.processed_data)} items, {len(self.alerts)} alerts")

def main():
    """Main function to run the ETL pipeline"""
    print("🚀 Inventory Monitoring Enterprise ETL Pipeline")
    print("=" * 60)
    
    # Create output directories
    Path("etl/output").mkdir(parents=True, exist_ok=True)
    Path("etl/logs").mkdir(parents=True, exist_ok=True)
    
    # Initialize ETL
    etl = InventoryETL()
    
    # Process Excel file
    excel_file = "test_inventory_main.xlsx"
    if not Path(excel_file).exists():
        print(f"Error: File '{excel_file}' not found!")
        print("Please run the sample data generator first:")
        print("python etl/scripts/sample_data_generator.py")
        return
    
    success = etl.process_excel_file(excel_file)
    
    if success:
        print("✅ ETL processing completed successfully!")
        print(f"📊 Processed {len(etl.processed_data)} items")
        print(f"🚨 Generated {len(etl.alerts)} alerts")
        
        # Show summary
        total_value = sum(item.get('total_value', 0) for item in etl.processed_data)
        print(f"💰 Total inventory value: ${total_value:,.2f}")
        
        # Show tier distribution
        tier_counts = {}
        for item in etl.processed_data:
            tier = item.get('tier', 'okay')
            tier_counts[tier] = tier_counts.get(tier, 0) + 1
        
        print("\n📈 Tier Distribution:")
        for tier, count in tier_counts.items():
            print(f"  {tier.replace('_', ' ').title()}: {count} items")
        
        # Save data
        etl.save_processed_data()
        
        print("\n📁 Output files created:")
        print("  - etl/output/processed_inventory.csv")
        print("  - etl/output/processed_inventory.json")
        print("  - etl/output/alerts.json")
        print("  - etl/output/business_intelligence_report.json")
        
    else:
        print("❌ ETL processing failed!")

if __name__ == "__main__":
    main() 