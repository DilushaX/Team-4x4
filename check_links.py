import os
import glob
from html.parser import HTMLParser

class LinkParser(HTMLParser):
    def __init__(self, current_file):
        super().__init__()
        self.links = []
        self.current_file = current_file
        
    def handle_starttag(self, tag, attrs):
        if tag in ['a', 'link', 'script', 'img']:
            for attr, value in attrs:
                if attr in ['href', 'src']:
                    self.links.append((tag, attr, value))

all_files = glob.glob('**/*.html', recursive=True) + glob.glob('**/*.php', recursive=True)
issues = []

for file in all_files:
    try:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            parser = LinkParser(file)
            parser.feed(content)
            
            for tag, attr, value in parser.links:
                if value.startswith('http') or value.startswith('mailto:') or value.startswith('tel:'):
                    continue
                if value == '#' or value == '':
                    issues.append(f"{file}: Empty or hash link: {tag} {attr}='{value}'")
                    continue
                
                # Strip query params or hash
                clean_value = value.split('?')[0].split('#')[0]
                if not clean_value:
                    continue
                
                dir_path = os.path.dirname(file)
                target_path = os.path.join(dir_path, clean_value)
                target_path = os.path.normpath(target_path)
                
                if not os.path.exists(target_path):
                    issues.append(f"{file}: Broken link: {tag} {attr}='{value}' (resolved to {target_path})")
    except Exception as e:
        print(f"Error parsing {file}: {e}")

for issue in issues:
    print(issue)
