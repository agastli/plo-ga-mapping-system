#!/usr/bin/env python3
"""
Batch export analytics data to ZIP file containing multiple PDF reports
"""
import json
import sys
import os
import zipfile
from pathlib import Path
import subprocess
import tempfile

def export_batch(data):
    """Export multiple analytics reports to a ZIP file"""
    try:
        entities = data.get('entities', [])
        format_type = data.get('format', 'pdf')  # pdf, excel, word, csv
        output_path = data.get('output_path')
        logo_path = data.get('logo_path')
        
        if not output_path:
            return {'success': False, 'error': 'Output path not provided'}
        
        if not entities:
            return {'success': False, 'error': 'No entities provided for export'}
        
        # Create temporary directory for individual files
        temp_dir = tempfile.mkdtemp()
        exported_files = []
        
        # Export each entity
        for entity in entities:
            entity_title = entity.get('title', 'Report')
            entity_data = entity.get('data', {})
            
            # Create safe filename
            safe_filename = entity_title.replace(' ', '_').replace('/', '-')
            
            # Determine file extension
            ext_map = {
                'pdf': 'pdf',
                'excel': 'xlsx',
                'word': 'docx',
                'csv': 'csv'
            }
            ext = ext_map.get(format_type, 'pdf')
            
            # Create temp file for this entity
            entity_file = os.path.join(temp_dir, f'{safe_filename}.{ext}')
            
            # Prepare export data
            export_data = {
                'data': entity_data,
                'output_path': entity_file,
            }
            
            # Add logo path for PDF and Word
            if format_type in ['pdf', 'word']:
                export_data['logo_path'] = logo_path
            
            # Create temp input file for the export script
            temp_input = os.path.join(temp_dir, f'input_{safe_filename}.json')
            with open(temp_input, 'w', encoding='utf-8') as f:
                json.dump(export_data, f)
            
            # Determine which export script to use
            script_map = {
                'pdf': 'export-analytics-to-pdf.py',
                'excel': 'export-analytics-to-excel.py',
                'word': 'export-analytics-to-word.py',
                'csv': 'export-analytics-to-csv.py'
            }
            script_name = script_map.get(format_type, 'export-analytics-to-pdf.py')
            script_path = os.path.join(os.path.dirname(__file__), script_name)
            
            # Run the export script
            result = subprocess.run(
                ['python3', script_path, temp_input],
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                print(f'Warning: Failed to export {entity_title}: {result.stderr}', file=sys.stderr)
                continue
            
            # Parse result
            try:
                export_result = json.loads(result.stdout.strip())
                if export_result.get('success'):
                    exported_files.append(entity_file)
                else:
                    print(f'Warning: Export failed for {entity_title}: {export_result.get("error")}', file=sys.stderr)
            except json.JSONDecodeError:
                print(f'Warning: Invalid JSON response for {entity_title}', file=sys.stderr)
            
            # Clean up temp input file
            try:
                os.unlink(temp_input)
            except:
                pass
        
        if not exported_files:
            return {'success': False, 'error': 'No files were successfully exported'}
        
        # Create ZIP file
        with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for file_path in exported_files:
                zipf.write(file_path, os.path.basename(file_path))
        
        # Clean up temp directory
        for file_path in exported_files:
            try:
                os.unlink(file_path)
            except:
                pass
        try:
            os.rmdir(temp_dir)
        except:
            pass
        
        return {
            'success': True,
            'output_path': output_path,
            'files_exported': len(exported_files)
        }
        
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    if len(sys.argv) != 2:
        print(json.dumps({'success': False, 'error': 'Usage: export-analytics-batch.py <input_json_file>'}))
        sys.exit(1)
    
    input_file = sys.argv[1]
    
    try:
        # Read input data
        with open(input_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        # Export batch
        result = export_batch(input_data)
        
        # Print result as JSON
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
