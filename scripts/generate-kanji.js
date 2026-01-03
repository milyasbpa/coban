#!/usr/bin/env node
/**
 * Generate kanji.json from unit files
 * Runs automatically before dev/build to keep data fresh
 */

const fs = require('fs');
const path = require('path');

const LEVELS = ['n5', 'n4', 'n3', 'n2'];
const DATA_DIR = path.join(__dirname, '..', 'data');

function generateKanjiForLevel(level) {
  const levelPath = path.join(DATA_DIR, level, 'kanji');
  const unitPath = path.join(levelPath, 'unit');
  const outputPath = path.join(levelPath, 'kanji.json');

  if (!fs.existsSync(unitPath)) {
    console.error(`❌ Unit directory not found: ${unitPath}`);
    return false;
  }

  // Get all JSON files from unit directory
  const files = fs.readdirSync(unitPath)
    .filter(f => f.endsWith('.json'))
    .sort((a, b) => parseInt(a) - parseInt(b));

  console.log(`📁 ${level.toUpperCase()}: Loading ${files.length} unit files...`);

  // Load all kanji data
  const items = [];
  for (const file of files) {
    try {
      const filePath = path.join(unitPath, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const kanji = JSON.parse(content);
      items.push(kanji);
    } catch (error) {
      console.error(`   ⚠️  Error loading ${file}:`, error.message);
    }
  }

  // Sort by ID
  items.sort((a, b) => (a.id || 0) - (b.id || 0));

  // Create output structure
  const output = { items };

  // Write to kanji.json
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  
  console.log(`   ✅ Generated kanji.json with ${items.length} items`);
  return true;
}

function main() {
  console.log('='.repeat(70));
  console.log('🔄 Generating kanji.json from unit files...');
  console.log('='.repeat(70));
  console.log();

  const startTime = Date.now();
  let successCount = 0;

  for (const level of LEVELS) {
    if (generateKanjiForLevel(level)) {
      successCount++;
    }
  }

  const duration = Date.now() - startTime;

  console.log();
  console.log('='.repeat(70));
  console.log(`✅ Generated ${successCount}/${LEVELS.length} files in ${duration}ms`);
  console.log('='.repeat(70));

  process.exit(successCount === LEVELS.length ? 0 : 1);
}

main();
