#!/usr/bin/env python3
"""
Script to add empty sentences array to N3 and N2 kanji unit files
Phase 0 of kanji migration plan
"""

import json
import os
from pathlib import Path

def add_sentences_to_examples(data):
    """
    Add 'sentences': [] to all examples in readings structure
    """
    modified = False
    
    # Process readings (kun and on)
    if 'readings' in data:
        readings = data['readings']
        
        # Process kun readings
        if 'kun' in readings and isinstance(readings['kun'], list):
            for kun_reading in readings['kun']:
                if 'examples' in kun_reading and isinstance(kun_reading['examples'], list):
                    for example in kun_reading['examples']:
                        if 'sentences' not in example:
                            example['sentences'] = []
                            modified = True
        
        # Process on readings
        if 'on' in readings and isinstance(readings['on'], list):
            for on_reading in readings['on']:
                if 'examples' in on_reading and isinstance(on_reading['examples'], list):
                    for example in on_reading['examples']:
                        if 'sentences' not in example:
                            example['sentences'] = []
                            modified = True
        
        # Process exception examples if exists
        if 'exception' in readings and readings['exception']:
            if isinstance(readings['exception'], dict) and 'examples' in readings['exception']:
                if isinstance(readings['exception']['examples'], list):
                    for example in readings['exception']['examples']:
                        if 'sentences' not in example:
                            example['sentences'] = []
                            modified = True
    
    return data, modified

def process_level(level_path):
    """
    Process all unit files in a level directory
    """
    unit_path = level_path / 'unit'
    
    if not unit_path.exists():
        print(f"❌ Unit directory not found: {unit_path}")
        return 0, 0
    
    json_files = sorted(unit_path.glob('*.json'))
    total_files = len(json_files)
    modified_count = 0
    
    print(f"\n📁 Processing {level_path.name.upper()}...")
    print(f"   Found {total_files} files")
    
    for json_file in json_files:
        try:
            with open(json_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            updated_data, was_modified = add_sentences_to_examples(data)
            
            if was_modified:
                # Write back with proper formatting
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(updated_data, f, ensure_ascii=False, indent=2)
                modified_count += 1
                
        except Exception as e:
            print(f"   ⚠️  Error processing {json_file.name}: {e}")
    
    print(f"   ✅ Modified {modified_count}/{total_files} files")
    return total_files, modified_count

def main():
    print("=" * 60)
    print("🚀 KANJI MIGRATION - PHASE 0")
    print("   Adding sentences array to N3 and N2 unit files")
    print("=" * 60)
    
    # Base data directory
    base_path = Path(__file__).parent / 'data'
    
    # Process N3
    n3_path = base_path / 'n3' / 'kanji'
    n3_total, n3_modified = process_level(n3_path)
    
    # Process N2
    n2_path = base_path / 'n2' / 'kanji'
    n2_total, n2_modified = process_level(n2_path)
    
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"N3: {n3_modified}/{n3_total} files updated")
    print(f"N2: {n2_modified}/{n2_total} files updated")
    print(f"Total: {n3_modified + n2_modified}/{n3_total + n2_total} files updated")
    print("=" * 60)
    print("✅ Phase 0 completed successfully!")
    print("\nNext steps:")
    print("1. Verify changes with: git diff data/n3/kanji/unit/1.json")
    print("2. Run: git add data/n3/kanji/unit data/n2/kanji/unit")
    print("3. Run: git commit -m 'Phase 0: Add sentences structure to N3/N2'")

if __name__ == '__main__':
    main()
