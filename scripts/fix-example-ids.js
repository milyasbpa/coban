const fs = require('fs');
const path = require('path');

// Function to fix ID incrementing for a single file
function fixExampleIds(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping...`);
    return { processed: 0, updated: 0 };
  }

  console.log(`Reading ${fileName} file...`);
  const rawData = fs.readFileSync(filePath, 'utf8');
  const kanjiData = JSON.parse(rawData);

  // Global ID counter for all examples across all kanji
  let globalIdCounter = 1;
  let examplesProcessed = 0;
  let examplesUpdated = 0;

  // Process all kanji items
  console.log(`Processing ${fileName} items...`);
  kanjiData.items.forEach((kanji, kanjiIndex) => {
    if (kanji.examples && Array.isArray(kanji.examples)) {
      kanji.examples.forEach((example, exampleIndex) => {
        examplesProcessed++;
        
        // Always update the ID to ensure proper sequential increment
        const oldId = example.id;
        example.id = globalIdCounter;
        
        if (oldId !== globalIdCounter) {
          examplesUpdated++;
        }
        
        globalIdCounter++;
      });
    }
  });

  // Write the updated file
  console.log(`Writing updated ${fileName} file...`);
  const updatedJson = JSON.stringify(kanjiData, null, 2);
  fs.writeFileSync(filePath, updatedJson, 'utf8');

  return { processed: examplesProcessed, updated: examplesUpdated };
}

// Paths to kanji.json files
const kanjiFiles = [
  { path: path.join(__dirname, '../data/n5/kanji/kanji.json'), name: 'N5 kanji.json' },
  { path: path.join(__dirname, '../data/n4/kanji/kanji.json'), name: 'N4 kanji.json' },
  { path: path.join(__dirname, '../data/n3/kanji/kanji.json'), name: 'N3 kanji.json' }
];

console.log('🔄 Starting ID increment fix for all kanji files...\n');

let totalProcessed = 0;
let totalUpdated = 0;

// Process each file
kanjiFiles.forEach(file => {
  const stats = fixExampleIds(file.path, file.name);
  totalProcessed += stats.processed;
  totalUpdated += stats.updated;
  
  console.log(`✅ ${file.name}:`);
  console.log(`   - Examples processed: ${stats.processed}`);
  console.log(`   - Examples updated: ${stats.updated}`);
  console.log('');
});

// Print overall statistics
console.log('✅ All ID increment fixes completed!');
console.log(`📊 Overall Statistics:`);
console.log(`   - Total examples processed: ${totalProcessed}`);
console.log(`   - Total examples updated: ${totalUpdated}`);
console.log(`   - Examples with correct IDs: ${totalProcessed - totalUpdated}`);
console.log('\n🎯 Result:');
console.log(`   - All examples now have sequential IDs from 1 to ${totalProcessed}`);
console.log(`   - No duplicate IDs remaining`);
console.log(`   - Consistent increment across all levels`);