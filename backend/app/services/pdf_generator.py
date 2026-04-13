"""
Generador de reportes PDF para análisis de datos
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List
import base64
import io

# Usar reportlab para PDFs
try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.pdfgen import canvas
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    print("⚠️ reportlab no instalado. PDFs no disponibles.")

def generate_pdf_report(analysis_data: Dict[str, Any], charts_images: List[bytes] = None) -> bytes:
    """
    Genera un reporte PDF completo del análisis
    """
    if not REPORTLAB_AVAILABLE:
        return None
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=18
    )
    
    # Contenedor para elementos
    elements = []
    styles = getSampleStyleSheet()
    
    # Estilo personalizado
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#6366f1'),
        spaceAfter=30,
        alignment=1  # Centrado
    )
    
    # Título
    elements.append(Paragraph("📊 Reporte de Análisis - NexusData AI", title_style))
    elements.append(Spacer(1, 20))
    
    # Fecha
    date_style = ParagraphStyle(
        'DateStyle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.grey,
        alignment=1
    )
    elements.append(Paragraph(f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}", date_style))
    elements.append(Spacer(1, 30))
    
    # Resumen
    result = analysis_data.get('result', {})
    summary = result.get('summary', {})
    
    elements.append(Paragraph("📈 Resumen del Análisis", styles['Heading2']))
    elements.append(Spacer(1, 12))
    
    # Tabla de resumen
    summary_data = [
        ['Métrica', 'Valor'],
        ['Filas analizadas', str(summary.get('total_rows', 0))],
        ['Columnas', str(summary.get('total_columns', 0))],
        ['Calidad de datos', f"{summary.get('data_quality_score', 0)}%"],
        ['Anomalías detectadas', str(result.get('anomaly_detection', {}).get('detected_rows', 0))],
    ]
    
    summary_table = Table(summary_data, colWidths=[3*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6366f1')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('ALIGN', (0, 1), (0, -1), 'LEFT'),
        ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
    ]))
    
    elements.append(summary_table)
    elements.append(Spacer(1, 20))
    
    # Insights de IA
    insights = result.get('business_insights', '')
    if insights and 'Insight Engine Disabled' not in insights:
        elements.append(PageBreak())
        elements.append(Paragraph("🧠 Insights de Inteligencia Artificial", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Convertir markdown simple a texto plano para PDF
        insights_clean = insights.replace('**', '').replace('#', '').replace('*', '')
        elements.append(Paragraph(insights_clean, styles['Normal']))
        elements.append(Spacer(1, 20))
    
    # Gráficos recomendados
    charts = result.get('chart_recommendations', [])
    if charts:
        elements.append(PageBreak())
        elements.append(Paragraph("📊 Gráficos Recomendados", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        for i, chart in enumerate(charts, 1):
            elements.append(Paragraph(
                f"{i}. {chart.get('title', 'Gráfico')} ({chart.get('type', 'chart')})",
                styles['Heading3']
            ))
            elements.append(Paragraph(
                f"💡 {chart.get('insight', 'Sin descripción')}",
                styles['Normal']
            ))
            elements.append(Spacer(1, 12))
    
    # Estadísticas descriptivas (muestra)
    stats = result.get('descriptive_statistics', {})
    if stats:
        elements.append(PageBreak())
        elements.append(Paragraph("📉 Estadísticas Descriptivas (Muestra)", styles['Heading2']))
        elements.append(Spacer(1, 12))
        
        # Mostrar solo primeras 3 columnas para no saturar
        sample_stats = dict(list(stats.items())[:3])
        for col_name, col_stats in sample_stats.items():
            elements.append(Paragraph(f"<b>{col_name}:</b>", styles['Heading4']))
            if isinstance(col_stats, dict):
                stats_text = ', '.join([f"{k}: {v:.2f}" if isinstance(v, (int, float)) else f"{k}: {v}" 
                                       for k, v in list(col_stats.items())[:5]])
                elements.append(Paragraph(stats_text, styles['Normal']))
            elements.append(Spacer(1, 6))
    
    # Footer
    elements.append(Spacer(1, 30))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=1
    )
    elements.append(Paragraph("Reporte generado por NexusData AI - https://nexusdata.ai", footer_style))
    
    # Construir PDF
    doc.build(elements)
    
    pdf = buffer.getvalue()
    buffer.close()
    
    return pdf
