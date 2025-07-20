#!/usr/bin/env node

/**
 * Add Cards Script
 * 
 * This script allows you to add cards to the timeline game database
 * Usage: node scripts/add-cards.js [options]
 * 
 * Options:
 *   --file <path>     Load cards from a JSON file
 *   --single          Add a single card interactively
 *   --bulk            Add multiple cards interactively
 *   --dry-run         Show what would be added without actually adding
 */

const { query } = require('../config/database');
const fs = require('fs').promises;
const readline = require('readline');

// Sample card data structure
const sampleCard = {
  title: 'Sample Event',
  description: 'A sample historical event',
  dateOccurred: '1900-01-01',
  category: 'History',
  difficulty: 2
};

// Available categories
const categories = [
  'History', 'Technology', 'Science', 'Space', 'Aviation', 
  'Cultural', 'Military', 'Political', 'Disaster'
];

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Ask a question and return the answer
 */
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * Validate a date string
 */
function isValidDate(dateString) {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Validate card data
 */
function validateCard(card) {
  const errors = [];
  
  if (!card.title || card.title.trim().length === 0) {
    errors.push('Title is required');
  }
  
  if (!card.dateOccurred || !isValidDate(card.dateOccurred)) {
    errors.push('Valid date is required (YYYY-MM-DD format)');
  }
  
  if (!card.category || !categories.includes(card.category)) {
    errors.push(`Category must be one of: ${categories.join(', ')}`);
  }
  
  if (!card.difficulty || card.difficulty < 1 || card.difficulty > 5) {
    errors.push('Difficulty must be between 1 and 5');
  }
  
  return errors;
}

/**
 * Add a single card to the database
 */
async function addCard(card) {
  try {
    const result = await query(`
      INSERT INTO cards (title, description, date_occurred, category, difficulty)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, title
    `, [card.title, card.description || null, card.dateOccurred, card.category, card.difficulty]);
    
    return result.rows[0];
  } catch (error) {
    throw new Error(`Failed to add card: ${error.message}`);
  }
}

/**
 * Add a single card interactively
 */
async function addSingleCard() {
  console.log('\n=== Add Single Card ===\n');
  
  const card = {};
  
  // Get title
  card.title = await askQuestion('Title: ');
  
  // Get description
  card.description = await askQuestion('Description (optional): ');
  
  // Get date
  while (true) {
    const dateInput = await askQuestion('Date (YYYY-MM-DD): ');
    if (isValidDate(dateInput)) {
      card.dateOccurred = dateInput;
      break;
    }
    console.log('Invalid date format. Please use YYYY-MM-DD');
  }
  
  // Get category
  console.log('\nAvailable categories:');
  categories.forEach((cat, index) => {
    console.log(`${index + 1}. ${cat}`);
  });
  
  while (true) {
    const categoryInput = await askQuestion('Category (number or name): ');
    const categoryIndex = parseInt(categoryInput) - 1;
    
    if (categoryIndex >= 0 && categoryIndex < categories.length) {
      card.category = categories[categoryIndex];
      break;
    } else if (categories.includes(categoryInput)) {
      card.category = categoryInput;
      break;
    }
    console.log('Invalid category. Please choose a number or category name.');
  }
  
  // Get difficulty
  while (true) {
    const difficultyInput = await askQuestion('Difficulty (1-5): ');
    const difficulty = parseInt(difficultyInput);
    if (difficulty >= 1 && difficulty <= 5) {
      card.difficulty = difficulty;
      break;
    }
    console.log('Difficulty must be between 1 and 5');
  }
  
  // Validate card
  const errors = validateCard(card);
  if (errors.length > 0) {
    console.log('\nValidation errors:');
    errors.forEach(error => console.log(`- ${error}`));
    return;
  }
  
  // Confirm
  console.log('\nCard to add:');
  console.log(JSON.stringify(card, null, 2));
  
  const confirm = await askQuestion('\nAdd this card? (y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }
  
  try {
    const result = await addCard(card);
    console.log(`✅ Card added successfully! ID: ${result.id}`);
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

/**
 * Load cards from a JSON file
 */
async function loadCardsFromFile(filePath, dryRun = false) {
  try {
    console.log(`\n=== Loading cards from ${filePath} ===\n`);
    
    const fileContent = await fs.readFile(filePath, 'utf8');
    const cards = JSON.parse(fileContent);
    
    if (!Array.isArray(cards)) {
      throw new Error('File must contain an array of cards');
    }
    
    console.log(`Found ${cards.length} cards to process`);
    
    let validCards = 0;
    let invalidCards = 0;
    let addedCards = 0;
    let errors = 0;
    
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      console.log(`\nProcessing card ${i + 1}/${cards.length}: ${card.title}`);
      
      // Validate card
      const validationErrors = validateCard(card);
      if (validationErrors.length > 0) {
        console.log(`❌ Invalid card: ${validationErrors.join(', ')}`);
        invalidCards++;
        continue;
      }
      
      validCards++;
      
      if (dryRun) {
        console.log(`✅ Would add: ${card.title}`);
        continue;
      }
      
      try {
        const result = await addCard(card);
        console.log(`✅ Added: ${result.title} (ID: ${result.id})`);
        addedCards++;
      } catch (error) {
        console.log(`❌ Failed to add: ${error.message}`);
        errors++;
      }
    }
    
    console.log(`\n=== Summary ===`);
    console.log(`Total cards: ${cards.length}`);
    console.log(`Valid cards: ${validCards}`);
    console.log(`Invalid cards: ${invalidCards}`);
    if (!dryRun) {
      console.log(`Successfully added: ${addedCards}`);
      console.log(`Errors: ${errors}`);
    }
    
  } catch (error) {
    console.error(`❌ Error loading file: ${error.message}`);
  }
}

/**
 * Add multiple cards interactively
 */
async function addMultipleCards() {
  console.log('\n=== Add Multiple Cards ===\n');
  console.log('Enter card details. Press Enter on an empty title to finish.\n');
  
  const cards = [];
  let cardNumber = 1;
  
  while (true) {
    console.log(`\n--- Card ${cardNumber} ---`);
    
    const card = {};
    
    // Get title
    card.title = await askQuestion('Title (or press Enter to finish): ');
    if (!card.title.trim()) {
      break;
    }
    
    // Get other fields
    card.description = await askQuestion('Description (optional): ');
    
    while (true) {
      const dateInput = await askQuestion('Date (YYYY-MM-DD): ');
      if (isValidDate(dateInput)) {
        card.dateOccurred = dateInput;
        break;
      }
      console.log('Invalid date format. Please use YYYY-MM-DD');
    }
    
    console.log('\nAvailable categories:');
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat}`);
    });
    
    while (true) {
      const categoryInput = await askQuestion('Category (number or name): ');
      const categoryIndex = parseInt(categoryInput) - 1;
      
      if (categoryIndex >= 0 && categoryIndex < categories.length) {
        card.category = categories[categoryIndex];
        break;
      } else if (categories.includes(categoryInput)) {
        card.category = categoryInput;
        break;
      }
      console.log('Invalid category. Please choose a number or category name.');
    }
    
    while (true) {
      const difficultyInput = await askQuestion('Difficulty (1-5): ');
      const difficulty = parseInt(difficultyInput);
      if (difficulty >= 1 && difficulty <= 5) {
        card.difficulty = difficulty;
        break;
      }
      console.log('Difficulty must be between 1 and 5');
    }
    
    // Validate card
    const errors = validateCard(card);
    if (errors.length > 0) {
      console.log('\nValidation errors:');
      errors.forEach(error => console.log(`- ${error}`));
      console.log('Please re-enter this card.');
      continue;
    }
    
    cards.push(card);
    cardNumber++;
  }
  
  if (cards.length === 0) {
    console.log('No cards to add.');
    return;
  }
  
  console.log(`\n=== Summary ===`);
  console.log(`Cards to add: ${cards.length}`);
  cards.forEach((card, index) => {
    console.log(`${index + 1}. ${card.title} (${card.dateOccurred})`);
  });
  
  const confirm = await askQuestion('\nAdd these cards? (y/N): ');
  if (confirm.toLowerCase() !== 'y') {
    console.log('Cancelled.');
    return;
  }
  
  let addedCards = 0;
  let errors = 0;
  
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    try {
      const result = await addCard(card);
      console.log(`✅ Added: ${result.title} (ID: ${result.id})`);
      addedCards++;
    } catch (error) {
      console.log(`❌ Failed to add ${card.title}: ${error.message}`);
      errors++;
    }
  }
  
  console.log(`\n=== Final Summary ===`);
  console.log(`Successfully added: ${addedCards}`);
  console.log(`Errors: ${errors}`);
}

/**
 * Show usage information
 */
function showUsage() {
  console.log(`
Add Cards Script

Usage: node scripts/add-cards.js [options]

Options:
  --file <path>     Load cards from a JSON file
  --single          Add a single card interactively
  --bulk            Add multiple cards interactively
  --dry-run         Show what would be added without actually adding

Examples:
  node scripts/add-cards.js --single
  node scripts/add-cards.js --file cards.json
  node scripts/add-cards.js --file cards.json --dry-run
  node scripts/add-cards.js --bulk

JSON file format:
[
  {
    "title": "Event Title",
    "description": "Event description",
    "dateOccurred": "1900-01-01",
    "category": "History",
    "difficulty": 2
  }
]
`);
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showUsage();
    process.exit(0);
  }
  
  try {
    // Test database connection
    await query('SELECT 1');
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
  
  const dryRun = args.includes('--dry-run');
  
  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    if (fileIndex === -1 || fileIndex === args.length - 1) {
      console.error('❌ --file option requires a file path');
      process.exit(1);
    }
    const filePath = args[fileIndex + 1];
    await loadCardsFromFile(filePath, dryRun);
  } else if (args.includes('--single')) {
    await addSingleCard();
  } else if (args.includes('--bulk')) {
    await addMultipleCards();
  } else {
    console.error('❌ No valid option specified');
    showUsage();
    process.exit(1);
  }
  
  rl.close();
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\nScript interrupted. Exiting...');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Script failed:', error.message);
    rl.close();
    process.exit(1);
  });
}

module.exports = {
  addCard,
  validateCard,
  categories
}; 