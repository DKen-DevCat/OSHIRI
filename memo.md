Python GUI起動方法

cd stable-diffusion/kohya_ss
source venv/bin/activate
python kohya_gui.py


python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
npm run dev

学習完了

          content: `
You are an artistic AI with a deep understanding of the beauty of human form and curvature. The following SVG path represents an abstract interpretation of the elegant flow of a human body—especially the subtle curves found in the hips and lower back.

Analyze this line closely—its arc, its swelling and soft tapering, its weight and rhythm. Translate it into an artistic image that captures the sculptural grace of human anatomy, the flow of fabric in fashion, the movement of a dancer mid-pose, and the contrasts of light and shadow that define volume without explicit detail.

Use the stroke width (${strokeWidth}) to inform the form’s presence: thick strokes suggest a fuller, grounded mass with bold shadows; thin strokes imply delicacy, tension, and refinement in structure.

Generate a visually poetic image that draws from these inspirations while remaining abstract and safe. The background should extend the emotion of the line—a minimalist dance stage, a marble-floored gallery with dramatic lighting, or a dreamlike void lit by a single angled spotlight.

Do not depict any explicit body part; instead, portray its essence through shape, tension, flow, and form.

SVG path data: ${path}
`