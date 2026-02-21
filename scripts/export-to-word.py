#!/usr/bin/env python3
"""
Export PLO-GA mapping data to Word document format
Generates a document matching the uploaded template format
"""

import sys
import json
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

def set_cell_background(cell, fill):
    """Set cell background color"""
    shading_elm = OxmlElement('w:shd')
    shading_elm.set(qn('w:fill'), fill)
    cell._element.get_or_add_tcPr().append(shading_elm)

def create_mapping_document(data):
    """Create Word document from mapping data"""
    doc = Document()
    
    # Set up document margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)
    
    # Add logo if provided
    if data.get('logo_path'):
        try:
            doc.add_picture(data['logo_path'], width=Inches(1.5))
            last_paragraph = doc.paragraphs[-1]
            last_paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
        except:
            pass
    
    # Add title
    title = doc.add_heading(data['program_name'], level=1)
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.runs[0].font.color.rgb = RGBColor(139, 21, 56)  # Maroon color (#8B1538)
    
    # Add subtitle
    subtitle = doc.add_paragraph('PLO-Graduate Attributes Mapping Report')
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.runs[0].font.size = Pt(14)
    subtitle.runs[0].font.bold = True
    
    doc.add_paragraph()  # Spacing
    
    # Add program information
    info = doc.add_paragraph()
    info.add_run('College: ').bold = True
    info.add_run(data['college_name'])
    info.add_run('\nDepartment: ').bold = True
    info.add_run(data['department_name'])
    info.add_run('\nLanguage: ').bold = True
    info.add_run(data['language'])
    
    doc.add_paragraph()  # Spacing
    
    # Add PLOs section
    doc.add_heading('Program Learning Outcomes', level=2)
    doc.paragraphs[-1].runs[0].font.color.rgb = RGBColor(139, 21, 56)  # Maroon
    
    for plo in data['plos']:
        p = doc.add_paragraph(style='List Number')
        p.add_run(f"{plo['code']}: ").bold = True
        p.add_run(plo['description'])
    
    doc.add_paragraph()  # Spacing
    
    # Add mapping matrix
    doc.add_heading('PLO-Competency Mapping Matrix', level=2)
    doc.paragraphs[-1].runs[0].font.color.rgb = RGBColor(139, 21, 56)  # Maroon
    
    # Count total competencies
    total_comps = sum(len(ga['competencies']) for ga in data['gas'])
    
    # Create table
    table = doc.add_table(rows=len(data['plos']) + 2, cols=total_comps + 1)
    table.style = 'Table Grid'
    
    # Header row 1: GA names
    row_idx = 0
    col_idx = 1
    table.cell(row_idx, 0).text = 'PLO'
    set_cell_background(table.cell(row_idx, 0), '8B1538')  # Maroon
    table.cell(row_idx, 0).paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
    table.cell(row_idx, 0).paragraphs[0].runs[0].font.bold = True
    
    for ga in data['gas']:
        comp_count = len(ga['competencies'])
        if comp_count > 0:
            # Merge cells for GA header
            start_cell = table.cell(row_idx, col_idx)
            end_cell = table.cell(row_idx, col_idx + comp_count - 1)
            merged_cell = start_cell.merge(end_cell)
            merged_cell.text = f"{ga['code']}: {ga['name']}"
            set_cell_background(merged_cell, '8B1538')  # Maroon
            merged_cell.paragraphs[0].runs[0].font.color.rgb = RGBColor(255, 255, 255)
            merged_cell.paragraphs[0].runs[0].font.bold = True
            merged_cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            col_idx += comp_count
    
    # Header row 2: Competency codes
    row_idx = 1
    col_idx = 1
    for ga in data['gas']:
        for comp in ga['competencies']:
            cell = table.cell(row_idx, col_idx)
            cell.text = comp['code']
            set_cell_background(cell, 'D2B48C')  # Tan
            cell.paragraphs[0].runs[0].font.bold = True
            cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
            col_idx += 1
    
    # Data rows
    for plo_idx, plo in enumerate(data['plos']):
        row_idx = plo_idx + 2
        cell = table.cell(row_idx, 0)
        cell.text = plo['code']
        set_cell_background(cell, 'F5DEB3')  # Wheat
        cell.paragraphs[0].runs[0].font.bold = True
        
        col_idx = 1
        for ga in data['gas']:
            for comp in ga['competencies']:
                weight = plo['mappings'].get(comp['code'], '0.00')
                cell = table.cell(row_idx, col_idx)
                cell.text = weight
                cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
                col_idx += 1
    
    # Add total mappings count
    doc.add_paragraph()
    total_p = doc.add_paragraph()
    total_p.add_run('Total mappings: ').bold = True
    total_p.add_run(str(data['total_mappings']))
    
    doc.add_paragraph()  # Spacing
    
    # Add justifications
    doc.add_heading(f"Justifications ({len(data['justifications'])})", level=2)
    doc.paragraphs[-1].runs[0].font.color.rgb = RGBColor(139, 21, 56)  # Maroon
    
    for just in data['justifications']:
        p = doc.add_paragraph()
        p.add_run(f"{just['competency_code']}: {just['competency_name']}").bold = True
        p.add_run(f"\n{just['text']}")
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.space_after = Pt(12)
    
    return doc

def main():
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'No input data provided'}))
        sys.exit(1)
    
    try:
        # Read JSON data from stdin or argument
        if sys.argv[1] == '-':
            data = json.load(sys.stdin)
        else:
            data = json.loads(sys.argv[1])
        
        # Create document
        doc = create_mapping_document(data)
        
        # Save to output path
        output_path = data.get('output_path', '/tmp/mapping_output.docx')
        doc.save(output_path)
        
        print(json.dumps({'success': True, 'output_path': output_path}))
    
    except Exception as e:
        print(json.dumps({'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
