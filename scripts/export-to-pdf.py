#!/usr/bin/env python3
"""
Export PLO-GA mapping data to PDF format
Generates a PDF document with formatted mapping matrix
"""

import sys
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def create_mapping_pdf(data):
    """Create PDF document from mapping data"""
    output_path = data.get('output_path', '/tmp/mapping_output.pdf')
    
    # Create PDF with landscape orientation for matrix
    doc = SimpleDocTemplate(
        output_path,
        pagesize=landscape(A4),
        rightMargin=30,
        leftMargin=30,
        topMargin=30,
        bottomMargin=30
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#8B4513'),
        spaceAfter=12,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#8B4513'),
        spaceAfter=10
    )
    
    # Add logo if provided
    if data.get('logo_path'):
        try:
            logo = Image(data['logo_path'], width=1.5*inch, height=1.5*inch)
            logo.hAlign = 'CENTER'
            story.append(logo)
            story.append(Spacer(1, 12))
        except:
            pass
    
    # Add title
    story.append(Paragraph(data['program_name'], title_style))
    story.append(Paragraph("PLO-Graduate Attributes Mapping Report", styles['Heading2']))
    story.append(Spacer(1, 12))
    
    # Add program information
    info_data = [
        ['College:', data['college_name']],
        ['Department:', data['department_name']],
        ['Language:', data['language']]
    ]
    
    info_table = Table(info_data, colWidths=[1.5*inch, 4*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 20))
    
    # Add PLOs section
    story.append(Paragraph("Program Learning Outcomes", heading_style))
    
    for plo in data['plos']:
        plo_text = f"<b>{plo['code']}:</b> {plo['description']}"
        story.append(Paragraph(plo_text, styles['Normal']))
        story.append(Spacer(1, 6))
    
    story.append(PageBreak())
    
    # Add mapping matrix
    story.append(Paragraph("PLO-Competency Mapping Matrix", heading_style))
    story.append(Spacer(1, 12))
    
    # Build matrix table
    matrix_data = []
    
    # Header row 1: GA names
    header_row1 = ['PLO']
    for ga in data['gas']:
        comp_count = len(ga['competencies'])
        if comp_count > 0:
            header_row1.append(f"{ga['code']}: {ga['name']}")
            for _ in range(comp_count - 1):
                header_row1.append('')  # Placeholder for merged cells
    
    matrix_data.append(header_row1)
    
    # Header row 2: Competency codes
    header_row2 = ['']
    for ga in data['gas']:
        for comp in ga['competencies']:
            header_row2.append(comp['code'])
    
    matrix_data.append(header_row2)
    
    # Data rows
    for plo in data['plos']:
        row = [plo['code']]
        for ga in data['gas']:
            for comp in ga['competencies']:
                weight = plo['mappings'].get(comp['code'], '0.00')
                row.append(weight)
        matrix_data.append(row)
    
    # Calculate column widths
    total_comps = sum(len(ga['competencies']) for ga in data['gas'])
    comp_col_width = 0.4 * inch
    plo_col_width = 0.6 * inch
    col_widths = [plo_col_width] + [comp_col_width] * total_comps
    
    # Create table
    matrix_table = Table(matrix_data, colWidths=col_widths, repeatRows=2)
    
    # Calculate span ranges for GA headers
    table_style_commands = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B4513')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#D2B48C')),
        ('BACKGROUND', (0, 2), (0, -1), colors.HexColor('#F5DEB3')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 1), 'Helvetica-Bold'),
        ('FONTNAME', (0, 2), (0, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 8),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.black),
    ]
    
    # Add span commands for GA headers
    col_idx = 1
    for ga in data['gas']:
        comp_count = len(ga['competencies'])
        if comp_count > 1:
            table_style_commands.append(
                ('SPAN', (col_idx, 0), (col_idx + comp_count - 1, 0))
            )
        col_idx += comp_count
    
    matrix_table.setStyle(TableStyle(table_style_commands))
    story.append(matrix_table)
    
    # Add total mappings
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"<b>Total mappings:</b> {data['total_mappings']}", styles['Normal']))
    
    story.append(PageBreak())
    
    # Add justifications
    story.append(Paragraph(f"Justifications ({len(data['justifications'])})", heading_style))
    story.append(Spacer(1, 12))
    
    for just in data['justifications']:
        just_title = f"<b>{just['competency_code']}: {just['competency_name']}</b>"
        story.append(Paragraph(just_title, styles['Normal']))
        story.append(Spacer(1, 4))
        story.append(Paragraph(just['text'], styles['Normal']))
        story.append(Spacer(1, 10))
    
    # Build PDF
    doc.build(story)
    
    return output_path

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
        
        # Create PDF
        output_path = create_mapping_pdf(data)
        
        print(json.dumps({'success': True, 'output_path': output_path}))
    
    except Exception as e:
        import traceback
        print(json.dumps({'error': str(e), 'traceback': traceback.format_exc()}))
        sys.exit(1)

if __name__ == '__main__':
    main()
