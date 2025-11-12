#!/usr/bin/env python3
import json
import os

def fix_example_ids(file_path):
    """Fix example IDs in a kanji JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Check if data has 'items' key (N4/N5 structure) or is direct array (N2 structure)
        if isinstance(data, dict) and 'items' in data:
            # Handle N4/N5 structure
            kanji_list = data['items']
        elif isinstance(data, list):
            # Handle N2 structure
            kanji_list = data
        else:
            print(f"Unknown structure in {file_path}")
            return False
        
        # Fix each kanji's example IDs
        for kanji in kanji_list:
            if 'examples' in kanji:
                for i, example in enumerate(kanji['examples']):
                    example['id'] = i + 1
        
        # Write back to file
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"Fixed {file_path}")
        return True
    except Exception as e:
        print(f"Error fixing {file_path}: {e}")
        return False

# List of files to fix
files_to_fix = [
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n3/kanji/kanji.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n4/kanji/kanji.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n5/kanji/kanji.json'
]

# Fix all files
for file_path in files_to_fix:
    if os.path.exists(file_path):
        fix_example_ids(file_path)
    else:
        print(f"File not found: {file_path}")

print("All files processed!")