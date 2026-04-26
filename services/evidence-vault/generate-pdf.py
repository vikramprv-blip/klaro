from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.pagesizes import A4
import sys

input_file = sys.argv[1]
output = sys.argv[2]

with open(input_file, "r") as f:
    text = f.read()

doc = SimpleDocTemplate(output, pagesize=A4)
styles = getSampleStyleSheet()
story = []

for line in text.split("\n"):
    story.append(Paragraph(line, styles["Normal"]))
    story.append(Spacer(1, 8))

doc.build(story)

print("PDF generated:", output)
