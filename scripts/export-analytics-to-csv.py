#!/usr/bin/env python3
"""
Export analytics data to CSV format
"""
import json
import sys
import csv
from pathlib import Path

def export_to_csv(data):
    """Export analytics data to CSV"""
    try:
        # Extract data
        title = data.get('title', 'Analytics Report')
        metrics = data.get('metrics', [])
        table_data = data.get('table_data', [])
        timestamp = data.get('timestamp', '')
        output_path = data.get('output_path')
        
        if not output_path:
            return {'success': False, 'error': 'Output path not provided'}
        
        # Create CSV file
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            writer = csv.writer(csvfile)
            
            # Write title
            writer.writerow([title])
            if timestamp:
                writer.writerow([f'Generated on: {timestamp}'])
            writer.writerow([])  # Empty row
            
            # Write metrics section
            if metrics:
                writer.writerow(['Metrics'])
                writer.writerow(['Metric', 'Value'])
                for metric in metrics:
                    label = metric.get('label', '')
                    value = metric.get('value', '')
                    writer.writerow([label, value])
                writer.writerow([])  # Empty row
            
            # Write table data
            if table_data:
                writer.writerow(['Detailed Data'])
                for row in table_data:
                    writer.writerow(row)
        
        return {'success': True, 'output_path': output_path}
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Usage: export-analytics-to-csv.py <input_json_file>'}))
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input data
        with open(input_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        # Extract data and output path
        data = input_data.get('data', {})
        data['output_path'] = input_data.get('output_path')
        
        # Export to CSV
        result = export_to_csv(data)
        
        # Print result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
