#!/usr/bin/env python3
"""
Generate kanji.json from unit files
This consolidates individual unit/*.json files into single kanji.json per level
"""

import json
from pathlib import Path

def generate_kanji_json_for_level(level):
    """Generate kanji.json for a specific level from unit files"""
    base_path = Path(__file__).parent / 'data' / level / 'kanji'
    unit_path = base_path / 'unit'
    output_path = base_path / 'kanji_generated.json'
    
    if not unit_path.exists():
        print(f"❌ Unit directory not found: {unit_path}")
        return False
    
    # Load all unit files
    unit_files = sorted(unit_path.glob('*.json'), key=lambda x: int(x.stem))
    kanji_items = []
    
    print(f"\n📁 Processing {level.upper()}...")
    print(f"   Found {len(unit_files)} unit files")
    
    for unit_file in unit_files:
        try:
            with open(unit_file, 'r', encoding='utf-8') as f:
                kanji_data = json.load(f)
                kanji_items.append(kanji_data)
        except Exception as e:
            print(f"   ⚠️  Error loading {unit_file.name}: {e}")
    
    # Sort by ID
    kanji_items.sort(key=lambda x: x.get('id', 0))
    
    # Create the output structure
    output_data = {
        "items": kanji_items
    }
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)
    
    print(f"   ✅ Generated {output_path.name} with {len(kanji_items)} items")
    return True

def main():
    print("=" * 70)
    print("📦 GENERATING kanji.json from unit files")
    print("=" * 70)
    
    levels = ['n5', 'n4', 'n3', 'n2']
    success_count = 0
    
    for level in levels:
        if generate_kanji_json_for_level(level):
            success_count += 1
    
    print("\n" + "=" * 70)
    print("📊 SUMMARY")
    print("=" * 70)
    print(f"Successfully generated {success_count}/{len(levels)} files")
    print("=" * 70)
    print("\n✅ Generation complete!")
    print("\nGenerated files:")
    print("  - data/n5/kanji/kanji_generated.json")
    print("  - data/n4/kanji/kanji_generated.json")
    print("  - data/n3/kanji/kanji_generated.json")
    print("  - data/n2/kanji/kanji_generated.json")
    print("\nNext steps:")
    print("1. Compare old vs new: diff data/n5/kanji/kanji.json data/n5/kanji/kanji_generated.json | head -50")
    print("2. If OK, replace: mv data/n5/kanji/kanji_generated.json data/n5/kanji/kanji.json")
    print("3. Do the same for n4, n3, n2")
    print("4. Commit: git add data/*/kanji/kanji.json")

if __name__ == '__main__':
    main()
