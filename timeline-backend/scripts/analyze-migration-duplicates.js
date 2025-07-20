const fs = require('fs');
const path = require('path');

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
          description
        });
      }
    }
  }
  
  return cards;
}

/**
 * Check for duplicates in a list of cards
 */
function findDuplicates(cards) {
  const duplicates = {
    exact: [],
    similar: [],
    sameDateDifferentTitle: [],
    sameTitleDifferentDate: []
  };
  
  for (let i = 0; i < cards.length; i++) {
    for (let j = i + 1; j < cards.length; j++) {
      const card1 = cards[i];
      const card2 = cards[j];
      
      // Check for exact duplicates (same title and date)
      if (card1.title === card2.title && card1.dateOccurred === card2.dateOccurred) {
        duplicates.exact.push({
          card1,
          card2,
          type: 'exact'
        });
      }
      
      // Check for same title, different date
      if (card1.title === card2.title && card1.dateOccurred !== card2.dateOccurred) {
        duplicates.sameTitleDifferentDate.push({
          card1,
          card2,
          type: 'same_title_different_date'
        });
      }
      
      // Check for same date, different title
      if (card1.dateOccurred === card2.dateOccurred && card1.title !== card2.title) {
        duplicates.sameDateDifferentTitle.push({
          card1,
          card2,
          type: 'same_date_different_title'
        });
      }
      
      // Check for similar titles (one contains the other)
      const title1Lower = card1.title.toLowerCase();
      const title2Lower = card2.title.toLowerCase();
      
      if (title1Lower !== title2Lower && 
          (title1Lower.includes(title2Lower) || title2Lower.includes(title1Lower))) {
        duplicates.similar.push({
          card1,
          card2,
          type: 'similar_title'
        });
      }
    }
  }
  
  return duplicates;
}

/**
 * Analyze migration files for duplicates
 */
function analyzeMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  const migrationFiles = [
    '002_sample_data.sql',
    '004_add_more_events.sql',
    '005_additional_historical_events.sql'
  ];
  
  console.log('🔍 Analyzing migration files for duplicate cards...\n');
  
  let allCards = [];
  const cardsByFile = {};
  
  // Read and analyze each migration file
  migrationFiles.forEach(filename => {
    const filePath = path.join(migrationsDir, filename);
    
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const cards = extractCardsFromSQL(content);
      
      cardsByFile[filename] = cards;
      allCards = allCards.concat(cards);
      
      console.log(`📄 ${filename}: ${cards.length} cards`);
    } else {
      console.log(`❌ ${filename}: File not found`);
    }
  });
  
  console.log(`\n📊 Total cards across all migrations: ${allCards.length}\n`);
  
  // Find duplicates
  const duplicates = findDuplicates(allCards);
  
  // Report results
  if (duplicates.exact.length > 0) {
    console.log('❌ EXACT DUPLICATES FOUND:');
    const uniqueDuplicates = new Set();
    
    duplicates.exact.forEach(dup => {
      const key = `${dup.card1.title}|${dup.card1.dateOccurred}`;
      if (!uniqueDuplicates.has(key)) {
        uniqueDuplicates.add(key);
        
        // Find all occurrences of this duplicate
        const allOccurrences = allCards.filter(card => 
          card.title === dup.card1.title && card.dateOccurred === dup.card1.dateOccurred
        );
        
        console.log(`  - "${dup.card1.title}" (${dup.card1.dateOccurred}):`);
        allOccurrences.forEach((card, index) => {
          const file = findCardInFiles(card, cardsByFile);
          console.log(`    ${index + 1}. ${file} - ${card.description.substring(0, 50)}...`);
        });
        console.log('');
      }
    });
  } else {
    console.log('✅ No exact duplicates found');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (duplicates.sameTitleDifferentDate.length > 0) {
    console.log('⚠️  SAME TITLE, DIFFERENT DATES:');
    const uniqueSameTitle = new Set();
    
    duplicates.sameTitleDifferentDate.forEach(dup => {
      const key = dup.card1.title;
      if (!uniqueSameTitle.has(key)) {
        uniqueSameTitle.add(key);
        
        // Find all occurrences of this title
        const allOccurrences = allCards.filter(card => card.title === dup.card1.title);
        
        console.log(`  - "${dup.card1.title}":`);
        allOccurrences.forEach(card => {
          const file = findCardInFiles(card, cardsByFile);
          console.log(`    ${card.dateOccurred} (${file})`);
        });
        console.log('');
      }
    });
  } else {
    console.log('✅ No same titles with different dates found');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (duplicates.similar.length > 0) {
    console.log('⚠️  SIMILAR TITLES:');
    const uniqueSimilar = new Set();
    
    duplicates.similar.forEach(dup => {
      const key = `${dup.card1.title}|${dup.card2.title}`;
      const reverseKey = `${dup.card2.title}|${dup.card1.title}`;
      
      if (!uniqueSimilar.has(key) && !uniqueSimilar.has(reverseKey)) {
        uniqueSimilar.add(key);
        
        console.log(`  - "${dup.card1.title}" vs "${dup.card2.title}"`);
        console.log(`    ${dup.card1.dateOccurred} (${findCardInFiles(dup.card1, cardsByFile)})`);
        console.log(`    ${dup.card2.dateOccurred} (${findCardInFiles(dup.card2, cardsByFile)})`);
        console.log('');
      }
    });
  } else {
    console.log('✅ No similar titles found');
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Summary by file
  console.log('📋 SUMMARY BY FILE:');
  Object.entries(cardsByFile).forEach(([filename, cards]) => {
    const uniqueTitles = new Set(cards.map(c => c.title));
    const uniqueDates = new Set(cards.map(c => c.dateOccurred));
    
    console.log(`  ${filename}:`);
    console.log(`    Total cards: ${cards.length}`);
    console.log(`    Unique titles: ${uniqueTitles.size}`);
    console.log(`    Unique dates: ${uniqueDates.size}`);
    
    if (cards.length !== uniqueTitles.size) {
      console.log(`    ⚠️  ${cards.length - uniqueTitles.size} duplicate titles within file`);
    }
    console.log('');
  });
  
  // Overall summary
  const uniqueTitles = new Set(allCards.map(c => c.title));
  const uniqueDates = new Set(allCards.map(c => c.dateOccurred));
  
  console.log('📊 OVERALL SUMMARY:');
  console.log(`  Total cards: ${allCards.length}`);
  console.log(`  Unique titles: ${uniqueTitles.size}`);
  console.log(`  Unique dates: ${uniqueDates.size}`);
  console.log(`  Duplicate titles: ${allCards.length - uniqueTitles.size}`);
  
  if (allCards.length !== uniqueTitles.size) {
    console.log(`  ⚠️  ${allCards.length - uniqueTitles.size} cards have duplicate titles across migrations`);
  }
}

/**
 * Find which file contains a specific card
 */
function findCardInFiles(card, cardsByFile) {
  for (const [filename, cards] of Object.entries(cardsByFile)) {
    const found = cards.find(c => 
      c.title === card.title && 
      c.dateOccurred === card.dateOccurred &&
      c.category === card.category
    );
    if (found) {
      return filename;
    }
  }
  return 'Unknown';
}

// Run the analysis
if (require.main === module) {
  analyzeMigrationFiles();
}

module.exports = { analyzeMigrationFiles, extractCardsFromSQL, findDuplicates }; 