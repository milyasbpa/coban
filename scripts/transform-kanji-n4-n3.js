const fs = require('fs');
const path = require('path');

// Path to kanji.json files
const n4KanjiFilePath = path.join(__dirname, '../data/n4/kanji/kanji.json');
const n3KanjiFilePath = path.join(__dirname, '../data/n3/kanji/kanji.json');

// Function to transform a single file
function transformKanjiFile(filePath, fileName) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  ${fileName} not found, skipping...`);
    return { processed: 0, updated: 0 };
  }

  console.log(`Reading ${fileName} file...`);
  const rawData = fs.readFileSync(filePath, 'utf8');
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
  console.log(`Processing ${fileName} items...`);
  kanjiData.items.forEach((kanji, kanjiIndex) => {
    if (kanji.examples && Array.isArray(kanji.examples)) {
      kanji.examples = kanji.examples.map((example, exampleIndex) => 
        transformExample(example, kanji.id, exampleIndex)
      );
    }
  });

  // Write the updated file
  console.log(`Writing updated ${fileName} file...`);
  const updatedJson = JSON.stringify(kanjiData, null, 2);
  fs.writeFileSync(filePath, updatedJson, 'utf8');

  return { processed: examplesProcessed, updated: examplesUpdated };
}

// Transform all files
console.log('🚀 Starting transformation for N4 and N3 kanji files...\n');

const n4Stats = transformKanjiFile(n4KanjiFilePath, 'N4 kanji.json');
console.log('');
const n3Stats = transformKanjiFile(n3KanjiFilePath, 'N3 kanji.json');

// Print overall statistics
console.log('\n✅ All transformations completed!');
console.log(`📊 Overall Statistics:`);
console.log(`   - N4 Examples processed: ${n4Stats.processed}, updated: ${n4Stats.updated}`);
console.log(`   - N3 Examples processed: ${n3Stats.processed}, updated: ${n3Stats.updated}`);
console.log(`   - Total processed: ${n4Stats.processed + n3Stats.processed}`);
console.log(`   - Total updated: ${n4Stats.updated + n3Stats.updated}`);