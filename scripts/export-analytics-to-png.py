#!/usr/bin/env python3
"""
Export analytics charts to PNG format
Reads from temp file, generates PNG chart images using matplotlib
"""

import sys
import json
import os
from datetime import datetime
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import numpy as np

def create_ga_chart(ga_stats, output_path):
    """Generate GA Alignment Scores bar chart"""
    
    # Extract data
    ga_codes = [ga['ga_code'] for ga in ga_stats]
    scores = [ga['avg_alignment_score'] for ga in ga_stats]
    
    # Create figure
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Define colors based on thresholds
    colors = []
    for score in scores:
        if score >= 80:
            colors.append('#22C55E')  # Green
        elif score >= 50:
            colors.append('#EAB308')  # Yellow
        else:
            colors.append('#EF4444')  # Red
    
    # Create bar chart
    bars = ax.bar(ga_codes, scores, color=colors, edgecolor='black', linewidth=0.5)
    
    # Add value labels on top of bars
    for bar, score in zip(bars, scores):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{score:.1f}%',
                ha='center', va='bottom', fontsize=10, fontweight='bold')
    
    # Customize chart
    ax.set_xlabel('Graduate Attribute', fontsize=12, fontweight='bold')
    ax.set_ylabel('Alignment Score (%)', fontsize=12, fontweight='bold')
    ax.set_title('Graduate Attribute Alignment Scores', 
                 fontsize=16, fontweight='bold', color='#8B1538', pad=20)
    ax.set_ylim(0, max(scores) * 1.2 if scores else 100)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    
    # Add legend
    green_patch = mpatches.Patch(color='#22C55E', label='Strong (≥80%)')
    yellow_patch = mpatches.Patch(color='#EAB308', label='Moderate (50-79%)')
    red_patch = mpatches.Patch(color='#EF4444', label='Weak (<50%)')
    ax.legend(handles=[green_patch, yellow_patch, red_patch], 
              loc='upper right', framealpha=0.9)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_competency_chart(competency_stats, output_path):
    """Generate Competency Average Weights bar chart"""
    
    # Sort competencies by GA order (C1-1, C1-2, ..., C5-5)
    sorted_comps = sorted(competency_stats, key=lambda x: (
        int(x['competency_code'].split('-')[0][1:]),
        int(x['competency_code'].split('-')[1])
    ))
    
    # Extract data
    comp_codes = [comp['competency_code'] for comp in sorted_comps]
    weights = [comp['avg_weight'] * 100 for comp in sorted_comps]  # Convert to percentage
    
    # Create figure
    fig, ax = plt.subplots(figsize=(14, 6))
    
    # Define colors based on thresholds
    colors = []
    for weight in weights:
        if weight >= 80:
            colors.append('#22C55E')  # Green
        elif weight >= 50:
            colors.append('#EAB308')  # Yellow
        else:
            colors.append('#EF4444')  # Red
    
    # Create bar chart
    bars = ax.bar(comp_codes, weights, color=colors, edgecolor='black', linewidth=0.5)
    
    # Add value labels on top of bars
    for bar, weight in zip(bars, weights):
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{weight:.1f}%',
                ha='center', va='bottom', fontsize=8, fontweight='bold')
    
    # Customize chart
    ax.set_xlabel('Competency Code', fontsize=12, fontweight='bold')
    ax.set_ylabel('Average Weight (%)', fontsize=12, fontweight='bold')
    ax.set_title('Competency Average Weights', 
                 fontsize=16, fontweight='bold', color='#8B1538', pad=20)
    ax.set_ylim(0, max(weights) * 1.2 if weights else 100)
    ax.grid(axis='y', alpha=0.3, linestyle='--')
    plt.xticks(rotation=45, ha='right')
    
    # Add legend
    green_patch = mpatches.Patch(color='#22C55E', label='Strong (≥80%)')
    yellow_patch = mpatches.Patch(color='#EAB308', label='Moderate (50-79%)')
    red_patch = mpatches.Patch(color='#EF4444', label='Weak (<50%)')
    ax.legend(handles=[green_patch, yellow_patch, red_patch], 
              loc='upper right', framealpha=0.9)
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def create_radar_chart(ga_stats, output_path):
    """Generate GA Coverage Profile radar chart"""
    
    # Extract data
    ga_codes = [ga['ga_code'] for ga in ga_stats]
    scores = [ga['avg_alignment_score'] for ga in ga_stats]
    
    # Number of variables
    num_vars = len(ga_codes)
    
    # Compute angle for each axis
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    
    # Complete the loop
    scores_plot = scores + [scores[0]]
    angles_plot = angles + [angles[0]]
    
    # Create figure
    fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(projection='polar'))
    
    # Plot data
    ax.plot(angles_plot, scores_plot, 'o-', linewidth=2, color='#8B1538', label='Alignment Score (%)')
    ax.fill(angles_plot, scores_plot, alpha=0.25, color='#8B1538')
    
    # Fix axis to go in the right order
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    
    # Draw axis lines for each angle and label
    ax.set_xticks(angles)
    ax.set_xticklabels(ga_codes, fontsize=12, fontweight='bold')
    
    # Set y-axis limits
    ax.set_ylim(0, 100)
    ax.set_yticks([25, 50, 75, 100])
    ax.set_yticklabels(['25', '50', '75', '100'], fontsize=10)
    
    # Add title
    ax.set_title('Graduate Attribute Coverage Profile',
                 fontsize=16, fontweight='bold', color='#8B1538', pad=30)
    
    # Add legend
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight', facecolor='white')
    plt.close()

def main():
    try:
        # Read input file path from command line
        if len(sys.argv) < 2:
            raise ValueError("Input file path required")
        
        input_file = sys.argv[1]
        
        # Read input data
        with open(input_file, 'r', encoding='utf-8') as f:
            input_data = json.load(f)
        
        data = input_data['data']
        
        # Generate output file paths
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_dir = os.path.dirname(input_file)
        
        ga_chart_path = os.path.join(output_dir, f'GA_Alignment_Scores_{timestamp}.png')
        comp_chart_path = os.path.join(output_dir, f'Competency_Average_Weights_{timestamp}.png')
        radar_chart_path = os.path.join(output_dir, f'GA_Coverage_Profile_{timestamp}.png')
        
        # Generate charts
        create_ga_chart(data['ga_stats'], ga_chart_path)
        create_competency_chart(data['competency_stats'], comp_chart_path)
        create_radar_chart(data['ga_stats'], radar_chart_path)
        
        # Return success with file paths
        result = {
            'success': True,
            'files': [
                {'name': f'GA_Alignment_Scores_{timestamp}.png', 'path': ga_chart_path},
                {'name': f'Competency_Average_Weights_{timestamp}.png', 'path': comp_chart_path},
                {'name': f'GA_Coverage_Profile_{timestamp}.png', 'path': radar_chart_path},
            ]
        }
        
        print(json.dumps(result))
        
    except Exception as e:
        result = {
            'success': False,
            'error': str(e)
        }
        print(json.dumps(result))
        sys.exit(1)

if __name__ == '__main__':
    main()
