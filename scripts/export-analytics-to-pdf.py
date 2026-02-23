#!/usr/bin/env python3
"""
Export analytics data to PDF format
Reads from temp file, generates professional PDF report
"""

import sys
import json
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfgen import canvas

def create_analytics_pdf(data, output_path, logo_path):
    """Generate PDF analytics report"""
    
    # Create PDF document in portrait mode
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=1*inch,
        bottomMargin=1*inch
    )
    
    # Container for PDF elements
    elements = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#8B1538'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=colors.HexColor('#8B1538'),
        spaceAfter=10,
        spaceBefore=20,
        fontName='Helvetica-Bold'
    )
    
    office_style = ParagraphStyle(
        'OfficeStyle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#666666'),
        alignment=TA_CENTER,
        spaceAfter=20
    )
    
    # Add QU Logo
    try:
        if os.path.exists(logo_path):
            logo = Image(logo_path, width=2.8*inch, height=0.6*inch, kind='proportional')
            elements.append(logo)
    except Exception as e:
        print(f"Warning: Could not add logo: {e}", file=sys.stderr)
    
    # Add office name
    elements.append(Paragraph("Academic Planning & Quality Assurance Office", office_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # Add title
    title = data.get('title', 'Analytics Report')
    elements.append(Paragraph(title, title_style))
    
    # Add timestamp
    if 'timestamp' in data:
        timestamp_style = ParagraphStyle(
            'TimestampStyle',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER,
            spaceAfter=20
        )
        elements.append(Paragraph(f"Generated on: {data['timestamp']}", timestamp_style))
    
    elements.append(Spacer(1, 0.3*inch))
    
    # Add summary metrics
    if 'metrics' in data:
        elements.append(Paragraph("Key Metrics", heading_style))
        
        metrics_data = [['Metric', 'Value']]
        for metric in data['metrics']:
            metrics_data.append([metric['label'], str(metric['value'])])
        
        metrics_table = Table(metrics_data, colWidths=[4*inch, 2*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B1538')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        elements.append(metrics_table)
        elements.append(Spacer(1, 0.3*inch))
    
    # Add chart images if provided (each as separate section)
    if 'chart_images' in data and len(data['chart_images']) > 0:
        elements.append(PageBreak())  # Start charts on new page
        for chart in data['chart_images']:
            if 'path' in chart and os.path.exists(chart['path']):
                # Add chart title
                elements.append(Paragraph(chart.get('title', 'Chart'), heading_style))
                try:
                    # Add chart image with proper sizing
                    chart_img = Image(chart['path'], width=6.5*inch, height=4*inch, kind='proportional')
                    elements.append(chart_img)
                    elements.append(Spacer(1, 0.4*inch))
                except Exception as e:
                    print(f"Warning: Could not add chart image {chart.get('title', '')}: {e}", file=sys.stderr)
    
    # Add data table if provided
    if 'table_data' in data and len(data['table_data']) > 0:
        elements.append(PageBreak())
        elements.append(Paragraph("Detailed Data", heading_style))
        
        table_data = data['table_data']
        data_table = Table(table_data, repeatRows=1)
        data_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#8B1538')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.lightgrey]),
        ]))
        elements.append(data_table)
    
    # Add footer with page numbers
    def add_page_number(canvas, doc):
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        page_num = canvas.getPageNumber()
        text = f"Page {page_num}"
        canvas.drawRightString(A4[0] - 0.75*inch, 0.5*inch, text)
        canvas.restoreState()
    
    # Build PDF
    doc.build(elements, onFirstPage=add_page_number, onLaterPages=add_page_number)
    
    return {"success": True, "path": output_path}

if __name__ == "__main__":
    try:
        # Read from temp file
        if len(sys.argv) < 2:
            print(json.dumps({"success": False, "error": "No input file provided"}))
            sys.exit(1)
        
        temp_file = sys.argv[1]
        with open(temp_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        data = input_data['data']
        output_path = input_data['output_path']
        logo_path = input_data.get('logo_path', '')
        
        result = create_analytics_pdf(data, output_path, logo_path)
        print(json.dumps(result))
        
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
