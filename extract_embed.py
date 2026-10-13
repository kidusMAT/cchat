import re
import urllib.request
import json

with open('embed.html', 'r', encoding='utf-8') as f:
    text = f.read()

print("File size:", len(text))
matches = re.findall(r'https://[^\s"\'<>]+', text)
for m in matches:
    if 'thumbnail' in m or 'figma-alpha' in m or 'image' in m:
        print("FOUND:", m)

# Search for JSON or INITIAL state
for tag in re.findall(r'<script[^>]*>(.*?)</script>', text, re.DOTALL):
    if 'INITIAL' in tag or 'figma' in tag:
        print("Script match len:", len(tag))
        if '2-2393' in tag or 'node-id' in tag or 'thumbnail' in tag:
            print("Found target in script! snippet:")
            print(tag[:500])
