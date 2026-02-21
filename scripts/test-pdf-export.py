#!/usr/bin/env python3
"""
Test script to generate a PDF export with sample data
"""

import json
import tempfile
import os
import sys

# Sample data matching the structure expected by export-to-pdf.py
test_data = {
    "output_path": "/home/ubuntu/test-export.pdf",
    "logo_path": "/home/ubuntu/plo-ga-mapping-system/client/public/qu-logo.png",
    "program_name": "Bachelor of Science in Chemical Engineering",
    "college_name": "College of Engineering",
    "department_name": "Department of Chemical Engineering",
    "language": "English",
    "last_updated": "February 21, 2026, 09:30 AM",
    "plos": [
        {
            "code": "PLO1",
            "description": "An ability to identify, formulate, and solve complex engineering problems by applying principles of engineering, science, and mathematics.",
            "mappings": {
                "C1-1": "1.00",
                "C1-2": "1.00",
                "C1-3": "1.00",
                "C1-4": "0.80",
                "C2-1": "0.20"
            }
        },
        {
            "code": "PLO2",
            "description": "An ability to apply engineering design to produce solutions that meet specified needs with consideration of public health, safety, and welfare.",
            "mappings": {
                "C1-1": "0.80",
                "C1-2": "0.80",
                "C1-3": "0.80",
                "C1-4": "0.80",
                "C2-1": "0.20"
            }
        }
    ],
    "gas": [
        {
            "code": "GA1",
            "name": "Competent",
            "competencies": [
                {
                    "code": "C1-1",
                    "name": "Subject-matter mastery"
                },
                {
                    "code": "C1-2",
                    "name": "Critical-thinking skills"
                },
                {
                    "code": "C1-3",
                    "name": "Problem-solving skills"
                },
                {
                    "code": "C1-4",
                    "name": "Research, and Novel and Adaptive Thinking"
                }
            ]
        },
        {
            "code": "GA2",
            "name": "Life-long Learner",
            "competencies": [
                {
                    "code": "C2-1",
                    "name": "Self-awareness"
                }
            ]
        }
    ],
    "justifications": [
        {
            "competency_code": "C1-1",
            "competency_name": "Subject-matter mastery",
            "text": "This competency is most strongly mapped to PLO1 (1.0) as it directly requires applying principles of engineering, science, and mathematics to solve complex problems. It also maps strongly to PLO2 (0.80) as engineering design requires deep subject-matter knowledge."
        },
        {
            "competency_code": "C1-2",
            "competency_name": "Critical-thinking skills",
            "text": "This competency is most strongly mapped to PLO1 (1.0) as formulating and solving complex engineering problems is the essence of critical thinking. It also maps strongly to PLO2 (0.80) as design requires critical evaluation of alternatives."
        }
    ],
    "total_mappings": 10
}

# Write test data to temp file
with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
    json.dump(test_data, f)
    temp_file = f.name

try:
    # Run the export script
    os.system(f'cd /home/ubuntu/plo-ga-mapping-system && python scripts/export-to-pdf.py {temp_file}')
    print(f"\nPDF generated successfully at: {test_data['output_path']}")
finally:
    # Clean up temp file
    os.unlink(temp_file)
