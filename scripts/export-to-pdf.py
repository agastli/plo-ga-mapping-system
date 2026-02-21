#!/usr/bin/env python3
"""
Export PLO-GA mapping data to PDF format
Generates a professional, beautifully styled PDF document
"""

import sys
import json
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak, Image, KeepTogether
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfgen import canvas

# Qatar University Maroon color
QU_MAROON = colors.HexColor('#8B1538')
QU_GOLD = colors.HexColor('#D4AF37')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
MEDIUM_GRAY = colors.HexColor('#E0E0E0')

class NumberedCanvas(canvas.Canvas):
    """Custom canvas to add page numbers"""
    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        """Add page numbers to each page"""
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        """Draw centered page number at bottom"""
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.gray)
        page_num = f"Page {self._pageNumber} of {page_count}"
        self.drawCentredString(A4[0] / 2, 0.5 * inch, page_num)

def create_mapping_pdf(data):
    """Create professional PDF document from mapping data"""
    output_path = data.get('output_path', '/tmp/mapping_output.pdf')
    
    # Create PDF with A4 size and custom margins
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    story = []
    styles = getSampleStyleSheet()
    
    # Custom styles with elegant typography
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=QU_MAROON,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
        leading=28
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#555555'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica',
        leading=18
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=QU_MAROON,
        spaceAfter=12,
        spaceBefore=16,
        fontName='Helvetica-Bold',
        borderWidth=0,
        borderColor=QU_MAROON,
        borderPadding=8,
        backColor=LIGHT_GRAY,
        leading=20
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        spaceAfter=8,
        fontName='Helvetica',
        leading=14,
        alignment=TA_JUSTIFY
    )
    
    # Add QU logo at the top (centered, professional size)
    if data.get('logo_path'):
        try:
            logo = Image(data['logo_path'], width=2*inch, height=2*inch)
            logo.hAlign = 'CENTER'
            story.append(logo)
            story.append(Spacer(1, 16))
        except:
            pass
    
    # Add decorative line
    line_data = [['', '']]
    line_table = Table(line_data, colWidths=[6.95*inch])
    line_table.setStyle(TableStyle([
        ('LINEABOVE', (0, 0), (-1, 0), 2, QU_MAROON),
        ('LINEBELOW', (0, 0), (-1, 0), 0.5, QU_GOLD),
    ]))
    story.append(line_table)
    story.append(Spacer(1, 20))
    
    # Add title with elegant styling
    story.append(Paragraph(data['program_name'], title_style))
    story.append(Paragraph("Program Learning Outcomes to Graduate Attributes Mapping", subtitle_style))
    
    # Add decorative line
    story.append(line_table)
    story.append(Spacer(1, 20))
    
    # Add program information in a styled box
    info_data = [
        ['College:', data['college_name']],
        ['Department:', data['department_name']],
        ['Language:', data['language']],
        ['Academic Planning & Quality Assurance Office', '']
    ]
    
    info_table = Table(info_data, colWidths=[2*inch, 4.95*inch])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, 2), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, 2), 'Helvetica'),
        ('FONTNAME', (0, 3), (-1, 3), 'Helvetica-Oblique'),
        ('FONTSIZE', (0, 0), (-1, 2), 11),
        ('FONTSIZE', (0, 3), (-1, 3), 9),
        ('TEXTCOLOR', (0, 0), (0, 2), QU_MAROON),
        ('TEXTCOLOR', (1, 0), (1, 2), colors.HexColor('#333333')),
        ('TEXTCOLOR', (0, 3), (-1, 3), colors.gray),
        ('BOTTOMPADDING', (0, 0), (-1, 2), 8),
        ('TOPPADDING', (0, 0), (-1, 2), 8),
        ('SPAN', (0, 3), (-1, 3)),
        ('ALIGN', (0, 3), (-1, 3), 'CENTER'),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 1, MEDIUM_GRAY),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 24))
    
    # Add PLOs section with elegant header
    story.append(Paragraph("Program Learning Outcomes", heading_style))
    story.append(Spacer(1, 10))
    
    for idx, plo in enumerate(data['plos'], 1):
        plo_text = f"<b><font color='#8B1538'>{plo['code']}:</font></b> {plo['description']}"
        story.append(Paragraph(plo_text, body_style))
    
    story.append(PageBreak())
    
    # Add mapping matrix with professional styling (transposed: PLOs as columns, competencies as rows)
    story.append(Paragraph("PLO-Competency Mapping Matrix", heading_style))
    story.append(Spacer(1, 12))
    
    # Build transposed matrix table
    matrix_data = []
    
    # Header row: Graduate Attributes label + PLO codes
    header_row = ['Graduate Attributes', 'Supporting Competencies'] + [plo['code'] for plo in data['plos']]
    matrix_data.append(header_row)
    
    # Data rows: GA sections with competencies
    for ga in data['gas']:
        # Add GA row (merged across first two columns)
        ga_row = [f"{ga['code']}: {ga['name']}", ''] + [''] * len(data['plos'])
        matrix_data.append(ga_row)
        
        # Add competency rows under this GA
        for comp in ga['competencies']:
            comp_row = ['', f"{comp['code']} – {comp['name']}"]
            # Add weights for each PLO
            for plo in data['plos']:
                weight = plo['mappings'].get(comp['code'], '0.00')
                comp_row.append(weight)
            matrix_data.append(comp_row)
    
    # Calculate column widths for transposed matrix
    available_width = 6.95 * inch
    ga_col_width = 1.2 * inch  # Graduate Attributes column
    comp_col_width = 2.5 * inch  # Competencies column
    plo_count = len(data['plos'])
    plo_col_width = (available_width - ga_col_width - comp_col_width) / plo_count
    col_widths = [ga_col_width, comp_col_width] + [plo_col_width] * plo_count
    
    # Create table with elegant styling
    matrix_table = Table(matrix_data, colWidths=col_widths, repeatRows=2)
    
    # Professional table styling for transposed matrix
    table_style_commands = [
        # Header row background
        ('BACKGROUND', (0, 0), (-1, 0), QU_MAROON),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 9),
        
        # Alignment
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('ALIGN', (2, 0), (-1, -1), 'CENTER'),  # PLO columns centered
        ('ALIGN', (0, 1), (1, -1), 'LEFT'),  # GA and competency columns left-aligned
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Borders
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('BOX', (0, 0), (-1, -1), 2, QU_MAROON),
        
        # Padding
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]
    
    # Add styling for GA section rows and competency rows
    row_idx = 1
    for ga in data['gas']:
        # GA row styling (merged first two columns)
        table_style_commands.extend([
            ('SPAN', (0, row_idx), (1, row_idx)),
            ('BACKGROUND', (0, row_idx), (-1, row_idx), colors.HexColor('#C8A882')),  # Light gold
            ('TEXTCOLOR', (0, row_idx), (-1, row_idx), QU_MAROON),
            ('FONTNAME', (0, row_idx), (-1, row_idx), 'Helvetica-Bold'),
            ('FONTSIZE', (0, row_idx), (-1, row_idx), 9),
        ])
        row_idx += 1
        
        # Competency rows styling
        for comp in ga['competencies']:
            table_style_commands.extend([
                ('BACKGROUND', (0, row_idx), (1, row_idx), LIGHT_GRAY),
                ('FONTNAME', (1, row_idx), (1, row_idx), 'Helvetica'),
                ('FONTSIZE', (0, row_idx), (-1, row_idx), 8),
            ])
            row_idx += 1
    
    matrix_table.setStyle(TableStyle(table_style_commands))
    story.append(matrix_table)
    
    # Add summary info
    story.append(Spacer(1, 16))
    total_comps = sum(len(ga['competencies']) for ga in data['gas'])
    summary_text = f"<b>Total Mappings:</b> {data['total_mappings']} | <b>Total PLOs:</b> {len(data['plos'])} | <b>Total Competencies:</b> {total_comps}"
    story.append(Paragraph(summary_text, body_style))
    
    story.append(PageBreak())
    
    # Add justifications with elegant formatting
    story.append(Paragraph(f"Competency Justifications ({len(data['justifications'])})", heading_style))
    story.append(Spacer(1, 12))
    
    for just in data['justifications']:
        # Create a styled box for each justification
        just_data = [[just['competency_code'], just['competency_name'], just['text']]]
        just_table = Table(just_data, colWidths=[0.8*inch, 2*inch, 4.15*inch])
        just_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, 0), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('TEXTCOLOR', (0, 0), (0, 0), colors.white),
            ('TEXTCOLOR', (1, 0), (1, 0), QU_MAROON),
            ('TEXTCOLOR', (2, 0), (2, 0), colors.HexColor('#333333')),
            ('BACKGROUND', (0, 0), (0, 0), QU_MAROON),
            ('BACKGROUND', (1, 0), (1, 0), LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, 0), 'TOP'),
            ('TOPPADDING', (0, 0), (-1, 0), 8),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('LEFTPADDING', (0, 0), (-1, 0), 8),
            ('RIGHTPADDING', (0, 0), (-1, 0), 8),
            ('BOX', (0, 0), (-1, -1), 1, MEDIUM_GRAY),
        ]))
        story.append(just_table)
        story.append(Spacer(1, 10))
    
    # Build PDF with custom canvas for page numbers
    doc.build(story, canvasmaker=NumberedCanvas)
    
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
