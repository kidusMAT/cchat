import urllib.request
import re

url = 'https://www.figma.com/file/TaqnOuwzfJkYUNMtS9DQ16'
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
}
req = urllib.request.Request(url, headers=headers)
with urllib.request.urlopen(req) as resp:
    data = resp.read().decode('utf-8', errors='ignore')

print('Downloaded length:', len(data))
with open('figma_page.html', 'w', encoding='utf-8') as f:
    f.write(data)

for m in re.finditer(r'https://api-cdn\.figma\.com[^\s"\'<>]+', data):
    print('api-cdn:', m.group(0))

for m in re.finditer(r'https://s3[^\s"\'<>]+', data):
    print('s3:', m.group(0))
