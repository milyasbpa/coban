const fs = require('fs');
const path = require('path');

// Path to kanji.json file
const kanjiFilePath = path.join(__dirname, '../data/n5/kanji/kanji.json');

// Read the original file
console.log('Reading kanji.json file...');
const rawData = fs.readFileSync(kanjiFilePath, 'utf8');
const kanjiData = JSON.parse(rawData);

// Track statistics
let examplesProcessed = 0;
let examplesUpdated = 0;
let idCounter = 1;

// Function to transform example
function transformExample(example, kanjiId, exampleIndex) {
  examplesProcessed++;
  
  // Check if example already has the new structure
  const hasOldStructure = example.meaning_id && example.meaning_en && !example.meanings;
  const hasId = example.id !== undefined;
  
  if (hasOldStructure || !hasId) {
    examplesUpdated++;
    
    // Add id if missing
    if (!hasId) {
      example.id = idCounter++;
    }
    
    // Transform meaning structure if old structure exists
    if (hasOldStructure) {
      example.meanings = {
        id: example.meaning_id,
        en: example.meaning_en
      };
      
      // Remove old properties
      delete example.meaning_id;
      delete example.meaning_en;
    }
  }
  
  return example;
}

// Process all kanji items
console.log('Processing kanji items...');
kanjiData.items.forEach((kanji, kanjiIndex) => {
  if (kanji.examples && Array.isArray(kanji.examples)) {
    kanji.examples = kanji.examples.map((example, exampleIndex) => 
      transformExample(example, kanji.id, exampleIndex)
    );
  }
});

// Write the updated file
console.log('Writing updated kanji.json file...');
const updatedJson = JSON.stringify(kanjiData, null, 2);
fs.writeFileSync(kanjiFilePath, updatedJson, 'utf8');

// Print statistics
console.log('\n✅ Transformation completed!');
console.log(`📊 Statistics:`);
console.log(`   - Total examples processed: ${examplesProcessed}`);
console.log(`   - Examples updated: ${examplesUpdated}`);
console.log(`   - Examples already up-to-date: ${examplesProcessed - examplesUpdated}`);
console.log(`\n🎯 Changes made:`);
console.log(`   - Added unique IDs to examples without IDs`);
console.log(`   - Converted meaning_id + meaning_en → meanings: { id, en }`);
console.log(`   - Maintained existing examples with new structure`);