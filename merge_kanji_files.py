#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import re

def get_kanji_files():
    """Get all kanji files in the correct order"""
    data_dir = "/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji"
    files = []
    
    # List all kanji files that match the pattern kanji-X-Y.json
    for filename in os.listdir(data_dir):
        if filename.startswith('kanji-') and filename.endswith('.json') and filename != 'kanji.json':
            # Extract the first number to sort properly
            match = re.match(r'kanji-(\d+)-(\d+)\.json', filename)
            if match:
                start_num = int(match.group(1))
                end_num = int(match.group(2))
                files.append((start_num, end_num, filename))
    
    # Sort by the first number
    files.sort(key=lambda x: x[0])
    
    return [f[2] for f in files]

def load_kanji_file(filepath):
    """Load a kanji JSON file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except Exception as e:
        print(f"Error loading {filepath}: {e}")
        return None

def save_kanji_file(filepath, data):
    """Save kanji data to JSON file"""
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"Successfully saved {filepath}")
        return True
    except Exception as e:
        print(f"Error saving {filepath}: {e}")
        return False

def merge_kanji_files():
    """Merge all kanji files into the main kanji.json"""
    data_dir = "/Users/ilyasbashirah/Documents/kerja/bas.co/coban/data/n2/kanji"
    main_file = os.path.join(data_dir, "kanji.json")
    
    # Load the main kanji.json file
    main_data = load_kanji_file(main_file)
    if not main_data:
        print("Failed to load main kanji.json file")
        return False
    
    # Ensure it has the correct structure
    if "items" not in main_data:
        print("Main kanji.json doesn't have 'items' structure")
        return False
    
    # Get the current highest ID in the main file
    current_max_id = 0
    for item in main_data["items"]:
        if item.get("id", 0) > current_max_id:
            current_max_id = item["id"]
    
    print(f"Current highest ID in kanji.json: {current_max_id}")
    
    # Get all kanji files to merge
    kanji_files = get_kanji_files()
    
    # Filter files starting from kanji-11-25.json
    start_merging = False
    files_to_merge = []
    
    for filename in kanji_files:
        if filename == "kanji-11-25.json":
            start_merging = True
        if start_merging:
            files_to_merge.append(filename)
    
    print(f"Files to merge: {len(files_to_merge)} files")
    for f in files_to_merge:
        print(f"  - {f}")
    
    # Merge each file
    next_id = current_max_id + 1
    
    for filename in files_to_merge:
        filepath = os.path.join(data_dir, filename)
        print(f"\nProcessing {filename}...")
        
        # Load the file
        file_data = load_kanji_file(filepath)
        if not file_data:
            print(f"  Failed to load {filename}, skipping...")
            continue
        
        # Handle both array and object structures
        items_to_add = []
        if isinstance(file_data, list):
            items_to_add = file_data
        elif isinstance(file_data, dict) and "items" in file_data:
            items_to_add = file_data["items"]
        else:
            print(f"  Unknown structure in {filename}, skipping...")
            continue
        
        # Add items with updated IDs
        added_count = 0
        for item in items_to_add:
            # Update the item's ID
            item["id"] = next_id
            
            # Add to main data
            main_data["items"].append(item)
            
            print(f"  Added kanji '{item.get('character', '?')}' with ID {next_id}")
            next_id += 1
            added_count += 1
        
        print(f"  Added {added_count} kanji from {filename}")
    
    # Save the updated main file
    if save_kanji_file(main_file, main_data):
        total_items = len(main_data["items"])
        print(f"\n✅ Successfully merged all files!")
        print(f"Total kanji in kanji.json: {total_items}")
        print(f"ID range: 1 to {next_id - 1}")
        return True
    else:
        print("\n❌ Failed to save the merged file")
        return False

if __name__ == "__main__":
    print("🚀 Starting kanji files merge process...")
    print("=" * 50)
    
    success = merge_kanji_files()
    
    print("=" * 50)
    if success:
        print("✅ Merge process completed successfully!")
    else:
        print("❌ Merge process failed!")