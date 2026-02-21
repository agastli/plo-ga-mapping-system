#!/usr/bin/env python3
"""
Export PLO-GA mapping data to Excel format
Generates a spreadsheet with formatted mapping matrix
"""

import sys
import json
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def create_mapping_excel(data):
    """Create Excel workbook from mapping data"""
    wb = Workbook()
    
    # Sheet 1: Program Information
    ws_info = wb.active
    ws_info.title = "Program Info"
    
    # Add program information
    ws_info['A1'] = 'Program Name:'
    ws_info['B1'] = data['program_name']
    ws_info['A2'] = 'College:'
    ws_info['B2'] = data['college_name']
    ws_info['A3'] = 'Department:'
    ws_info['B3'] = data['department_name']
    ws_info['A4'] = 'Language:'
    ws_info['B4'] = data['language']
    
    # Style headers
    for row in range(1, 5):
        ws_info[f'A{row}'].font = Font(bold=True)
    
    # Sheet 2: PLOs
    ws_plos = wb.create_sheet("PLOs")
    ws_plos['A1'] = 'PLO Code'
    ws_plos['B1'] = 'Description'
    
    # Header style
    header_fill = PatternFill(start_color="8B1538", end_color="8B1538", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF")
    
    for cell in ['A1', 'B1']:
        ws_plos[cell].fill = header_fill
        ws_plos[cell].font = header_font
    
    # Add PLOs
    for idx, plo in enumerate(data['plos'], start=2):
        ws_plos[f'A{idx}'] = plo['code']
        ws_plos[f'B{idx}'] = plo['description']
    
    # Adjust column widths
    ws_plos.column_dimensions['A'].width = 15
    ws_plos.column_dimensions['B'].width = 80
    
    # Sheet 3: Mapping Matrix
    ws_matrix = wb.create_sheet("Mapping Matrix")
    
    # Count total competencies
    total_comps = sum(len(ga['competencies']) for ga in data['gas'])
    
    # Create headers
    row_idx = 1
    col_idx = 2
    
    # PLO header
    ws_matrix.cell(row_idx, 1, 'PLO')
    ws_matrix.cell(row_idx, 1).fill = header_fill
    ws_matrix.cell(row_idx, 1).font = header_font
    
    # GA headers (merged cells)
    for ga in data['gas']:
        comp_count = len(ga['competencies'])
        if comp_count > 0:
            # Write GA name in first cell
            cell = ws_matrix.cell(row_idx, col_idx, f"{ga['code']}: {ga['name']}")
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal='center')
            
            # Merge cells for GA header
            if comp_count > 1:
                ws_matrix.merge_cells(
                    start_row=row_idx, start_column=col_idx,
                    end_row=row_idx, end_column=col_idx + comp_count - 1
                )
            
            col_idx += comp_count
    
    # Competency code headers
    row_idx = 2
    col_idx = 2
    tan_fill = PatternFill(start_color="D2B48C", end_color="D2B48C", fill_type="solid")
    
    for ga in data['gas']:
        for comp in ga['competencies']:
            cell = ws_matrix.cell(row_idx, col_idx, comp['code'])
            cell.fill = tan_fill
            cell.font = Font(bold=True)
            cell.alignment = Alignment(horizontal='center')
            col_idx += 1
    
    # Data rows
    wheat_fill = PatternFill(start_color="F5DEB3", end_color="F5DEB3", fill_type="solid")
    
    for plo_idx, plo in enumerate(data['plos']):
        row_idx = plo_idx + 3
        
        # PLO code
        cell = ws_matrix.cell(row_idx, 1, plo['code'])
        cell.fill = wheat_fill
        cell.font = Font(bold=True)
        
        # Weights
        col_idx = 2
        for ga in data['gas']:
            for comp in ga['competencies']:
                weight = plo['mappings'].get(comp['code'], '0.00')
                cell = ws_matrix.cell(row_idx, col_idx, weight)
                cell.alignment = Alignment(horizontal='center')
                col_idx += 1
    
    # Add borders to all cells
    thin_border = Border(
        left=Side(style='thin'),
        right=Side(style='thin'),
        top=Side(style='thin'),
        bottom=Side(style='thin')
    )
    
    for row in ws_matrix.iter_rows(min_row=1, max_row=len(data['plos']) + 2, 
                                    min_col=1, max_col=total_comps + 1):
        for cell in row:
            cell.border = thin_border
    
    # Adjust column widths
    ws_matrix.column_dimensions['A'].width = 12
    for col_idx in range(2, total_comps + 2):
        ws_matrix.column_dimensions[get_column_letter(col_idx)].width = 8
    
    # Sheet 4: Justifications
    ws_just = wb.create_sheet("Justifications")
    ws_just['A1'] = 'Competency Code'
    ws_just['B1'] = 'Competency Name'
    ws_just['C1'] = 'Justification'
    
    for cell in ['A1', 'B1', 'C1']:
        ws_just[cell].fill = header_fill
        ws_just[cell].font = header_font
    
    for idx, just in enumerate(data['justifications'], start=2):
        ws_just[f'A{idx}'] = just['competency_code']
        ws_just[f'B{idx}'] = just['competency_name']
        ws_just[f'C{idx}'] = just['text']
        ws_just[f'C{idx}'].alignment = Alignment(wrap_text=True, vertical='top')
    
    # Adjust column widths
    ws_just.column_dimensions['A'].width = 15
    ws_just.column_dimensions['B'].width = 30
    ws_just.column_dimensions['C'].width = 80
    
    return wb

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data provided'}))
        sys.exit(1)
    
    try:
        # Read JSON data
        if sys.argv[1] == '-':
            data = json.load(sys.stdin)
        else:
            data = json.loads(sys.argv[1])
        
        # Create workbook
        wb = create_mapping_excel(data)
        
        # Save to output path
        output_path = data.get('output_path', '/tmp/mapping_output.xlsx')
        wb.save(output_path)
        
        print(json.dumps({'success': True, 'output_path': output_path}))
    
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
