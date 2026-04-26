from docx import Document

doc = Document(r'C:\Users\tanis\Downloads\lead-intake-and-conversion-bottleneck-analysis.docx')

# Find and print the Measure section
in_measure = False

for para in doc.paragraphs:
    if para.text.strip():
        if 'Measure' in para.text and 'Current State' in para.text:
            in_measure = True
        if in_measure:
            print(para.text)
            if 'Analyze' in para.text and 'Root-Cause' in para.text:
                break
