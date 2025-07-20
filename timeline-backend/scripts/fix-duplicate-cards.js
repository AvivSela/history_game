const fs = require('fs');
const path = require('path');

/**
 * Cards to remove from 002_sample_data.sql (duplicates found in later migrations)
 */
const duplicatesToRemoveFrom002 = [
  'World War II ends',
  'First Moon Landing', 
  'Berlin Wall falls',
  'Titanic sinks',
  'Wright Brothers first flight',
  'World Wide Web invented',
  'American Civil War ends'
];

/**
 * Cards to remove from 004_add_more_events.sql (duplicates found in later migrations)
 */
const duplicatesToRemoveFrom004 = [
  'Julius Caesar assassinated',
  'Magna Carta signed',
  'American Civil War begins',
  'Eiffel Tower completed',
  'World War I begins',
  'World War II begins',
  'Pearl Harbor attack',
  'World Wide Web invented',
  'Berlin Wall falls'
];

/**
 * Extract card data from SQL INSERT statements
 */
function extractCardsFromSQL(sqlContent) {
  const cards = [];
  
  // Match INSERT statements for cards table
  const insertRegex = /INSERT INTO cards\s*\([^)]+\)\s*VALUES\s*([\s\S]*?);/gi;
  let match;
  
  while ((match = insertRegex.exec(sqlContent)) !== null) {
    const valuesSection = match[1];
    
    // Extract individual value tuples
    const valueRegex = /\(([^)]+)\)/g;
    let valueMatch;
    
    while ((valueMatch = valueRegex.exec(valuesSection)) !== null) {
      const values = valueMatch[1].split(',').map(v => v.trim());
      
      if (values.length >= 5) {
        // Parse the values (assuming: title, date_occurred, category, difficulty, description)
        const title = values[0].replace(/^'|'$/g, ''); // Remove quotes
        const dateOccurred = values[1].replace(/^'|'$/g, '');
        const category = values[2].replace(/^'|'$/g, '');
        const difficulty = parseInt(values[3]);
        const description = values[4].replace(/^'|'$/g, '');
        
        cards.push({
          title,
          dateOccurred,
          category,
          difficulty,
          description,
          originalLine: valueMatch[0] // Keep the original line for removal
        });
      }
    }
  }
  
  return cards;
}

/**
 * Remove duplicate cards from a migration file
 */
function removeDuplicateCards(filePath, cardsToRemove) {
  console.log(`\n🔧 Processing ${path.basename(filePath)}...`);
  
  const content = fs.readFileSync(filePath, 'utf8');
  const cards = extractCardsFromSQL(content);
  
  console.log(`  Original cards: ${cards.length}`);
  
  // Filter out cards to remove
  const cardsToKeep = cards.filter(card => !cardsToRemove.includes(card.title));
  const removedCards = cards.filter(card => cardsToRemove.includes(card.title));
  
  console.log(`  Cards to keep: ${cardsToKeep.length}`);
  console.log(`  Cards to remove: ${removedCards.length}`);
  
  if (removedCards.length > 0) {
    console.log('  Removing:');
    removedCards.forEach(card => {
      console.log(`    - "${card.title}" (${card.dateOccurred})`);
    });
  }
  
  // Rebuild the SQL content
  let newContent = content;
  
  // Remove the duplicate cards from the INSERT statement
  removedCards.forEach(card => {
    // Escape special regex characters in the card line
    const escapedLine = card.originalLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\s*${escapedLine}\\s*,?`, 'g');
    newContent = newContent.replace(regex, '');
  });
  
  // Clean up any trailing commas before the closing parenthesis
  newContent = newContent.replace(/,\s*\)/g, ')');
  
  // Write the updated content back to the file
  fs.writeFileSync(filePath, newContent, 'utf8');
  
  console.log(`  ✅ Updated ${path.basename(filePath)}`);
  
  return {
    originalCount: cards.length,
    keptCount: cardsToKeep.length,
    removedCount: removedCards.length,
    removedCards: removedCards.map(c => c.title)
  };
}

/**
 * Create a backup of the original files
 */
function createBackup(filePath) {
  const backupPath = filePath + '.backup';
  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(filePath, backupPath);
    console.log(`  📦 Created backup: ${path.basename(backupPath)}`);
  }
}

/**
 * Main function to fix duplicate cards
 */
function fixDuplicateCards() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  console.log('🔧 Fixing duplicate cards in migration files...\n');
  
  // Create backups first
  console.log('📦 Creating backups...');
  createBackup(path.join(migrationsDir, '002_sample_data.sql'));
  createBackup(path.join(migrationsDir, '004_add_more_events.sql'));
  
  // Fix 002_sample_data.sql
  const file002 = path.join(migrationsDir, '002_sample_data.sql');
  const result002 = removeDuplicateCards(file002, duplicatesToRemoveFrom002);
  
  // Fix 004_add_more_events.sql
  const file004 = path.join(migrationsDir, '004_add_more_events.sql');
  const result004 = removeDuplicateCards(file004, duplicatesToRemoveFrom004);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY OF CHANGES:');
  console.log('='.repeat(60));
  
  console.log(`\n002_sample_data.sql:`);
  console.log(`  Original: ${result002.originalCount} cards`);
  console.log(`  Kept: ${result002.keptCount} cards`);
  console.log(`  Removed: ${result002.removedCount} cards`);
  
  console.log(`\n004_add_more_events.sql:`);
  console.log(`  Original: ${result004.originalCount} cards`);
  console.log(`  Kept: ${result004.keptCount} cards`);
  console.log(`  Removed: ${result004.removedCount} cards`);
  
  const totalRemoved = result002.removedCount + result004.removedCount;
  console.log(`\nTotal duplicates removed: ${totalRemoved}`);
  console.log(`\n✅ Duplicate cards have been removed from migration files.`);
  console.log(`📦 Backups created with .backup extension.`);
  console.log(`\nNext steps:`);
  console.log(`1. Review the changes in the migration files`);
  console.log(`2. Run the migration analysis script again to verify no duplicates remain`);
  console.log(`3. Test the database migrations to ensure they work correctly`);
}

// Run the fix
if (require.main === module) {
  fixDuplicateCards();
}

module.exports = { fixDuplicateCards, removeDuplicateCards }; 