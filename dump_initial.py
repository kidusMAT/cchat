import json
import re

with open('embed.html', 'r', encoding='utf-8') as f:
    text = f.read()

for tag in re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL):
    if 'INITIAL_OPTIONS' in tag:
        try:
            data = json.loads(tag)
            with open('initial_options.json', 'w', encoding='utf-8') as out:
                json.dump(data, out, indent=2)
            print("Successfully dumped initial_options.json!")
        except Exception as e:
            print("JSON parse error:", e)
