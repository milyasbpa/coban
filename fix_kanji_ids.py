#!/usr/bin/env python3
import json
import os

def fix_example_ids(file_path):
    """Fix example IDs in a kanji JSON file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Fix each kanji's example IDs
        for kanji in data:
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
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-11-25.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-26-35.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-107-120.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-121-132.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-133-144.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-145-156.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-157-168.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-145-156.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-169-179.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-180-190.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-191-204.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-205-219.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-220-233.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-234-245.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-246-258.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-259-269.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-270-280.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-307-317.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-318-328.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-329-340.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-341-354.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-355-365.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-366-376.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-377-393.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-394-407.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-408-420.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-421-434.json',
    '/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji/kanji-435-448.json',
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