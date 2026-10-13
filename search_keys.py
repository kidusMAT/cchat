import json

with open('initial_options.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

def search_keys(obj, path=""):
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_path = f"{path}.{k}" if path else k
            if any(term in k.lower() for term in ['thumb', 'image', 'url', 'file', 'meta', 'title', 'node']):
                print(f"{new_path}: {str(v)[:150]}")
            search_keys(v, new_path)
    elif isinstance(obj, list):
        for i, item in enumerate(obj):
            search_keys(item, f"{path}[{i}]")

search_keys(data)
