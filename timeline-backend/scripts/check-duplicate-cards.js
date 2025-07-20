const { Pool } = require('pg');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5433,
  database: process.env.DB_NAME || 'timeline_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

const pool = new Pool(dbConfig);

/**
 * Check for duplicate cards in the database
 */
async function checkDuplicateCards() {
  const client = await pool.connect();
  
  try {
    console.log('🔍 Checking for duplicate cards...\n');

    // Check for exact duplicates (same title and date)
    const exactDuplicates = await client.query(`
      SELECT title, date_occurred, COUNT(*) as count
      FROM cards 
      GROUP BY title, date_occurred 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, title
    `);

    if (exactDuplicates.rows.length > 0) {
      console.log('❌ EXACT DUPLICATES FOUND:');
      exactDuplicates.rows.forEach(row => {
        console.log(`  - "${row.title}" (${row.date_occurred}): ${row.count} occurrences`);
      });
    } else {
      console.log('✅ No exact duplicates found');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Check for similar titles (potential duplicates with slight variations)
    const similarTitles = await client.query(`
      SELECT c1.title as title1, c1.date_occurred as date1, c1.category as category1,
             c2.title as title2, c2.date_occurred as date2, c2.category as category2
      FROM cards c1
      JOIN cards c2 ON c1.id < c2.id
      WHERE (
        -- Check for similar titles (case insensitive)
        LOWER(c1.title) = LOWER(c2.title) OR
        -- Check for titles that are very similar (one contains the other)
        LOWER(c1.title) LIKE LOWER(c2.title) || '%' OR
        LOWER(c2.title) LIKE LOWER(c1.title) || '%' OR
        -- Check for titles with same key words
        (LOWER(c1.title) LIKE '%' || LOWER(SPLIT_PART(c2.title, ' ', 1)) || '%' AND
         LOWER(c2.title) LIKE '%' || LOWER(SPLIT_PART(c1.title, ' ', 1)) || '%')
      )
      AND c1.date_occurred = c2.date_occurred
      ORDER BY c1.title, c2.title
    `);

    if (similarTitles.rows.length > 0) {
      console.log('⚠️  SIMILAR TITLES FOUND (same date):');
      similarTitles.rows.forEach(row => {
        console.log(`  - "${row.title1}" vs "${row.title2}" (${row.date1})`);
      });
    } else {
      console.log('✅ No similar titles found');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Check for same events with different dates (potential date inconsistencies)
    const sameEventDifferentDates = await client.query(`
      SELECT c1.title, c1.date_occurred as date1, c1.category as category1,
             c2.date_occurred as date2, c2.category as category2
      FROM cards c1
      JOIN cards c2 ON c1.id < c2.id
      WHERE (
        -- Check for very similar titles
        LOWER(c1.title) = LOWER(c2.title) OR
        -- Check for titles that are very similar (one contains the other)
        LOWER(c1.title) LIKE LOWER(c2.title) || '%' OR
        LOWER(c2.title) LIKE LOWER(c1.title) || '%'
      )
      AND c1.date_occurred != c2.date_occurred
      ORDER BY c1.title, c1.date_occurred
    `);

    if (sameEventDifferentDates.rows.length > 0) {
      console.log('⚠️  SAME EVENT WITH DIFFERENT DATES:');
      sameEventDifferentDates.rows.forEach(row => {
        console.log(`  - "${row.title}": ${row.date1} vs ${row.date2} (${row.category1} vs ${row.category2})`);
      });
    } else {
      console.log('✅ No same events with different dates found');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Check for events with same date but different titles (potential duplicates)
    const sameDateDifferentTitles = await client.query(`
      SELECT c1.title as title1, c1.category as category1,
             c2.title as title2, c2.category as category2,
             c1.date_occurred
      FROM cards c1
      JOIN cards c2 ON c1.id < c2.id
      WHERE c1.date_occurred = c2.date_occurred
      AND c1.title != c2.title
      ORDER BY c1.date_occurred, c1.title
    `);

    if (sameDateDifferentTitles.rows.length > 0) {
      console.log('⚠️  SAME DATE WITH DIFFERENT TITLES:');
      sameDateDifferentTitles.rows.forEach(row => {
        console.log(`  - ${row.date_occurred}: "${row.title1}" vs "${row.title2}" (${row.category1} vs ${row.category2})`);
      });
    } else {
      console.log('✅ No same dates with different titles found');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Summary statistics
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_cards,
        COUNT(DISTINCT title) as unique_titles,
        COUNT(DISTINCT date_occurred) as unique_dates,
        COUNT(DISTINCT category) as unique_categories,
        MIN(date_occurred) as earliest_date,
        MAX(date_occurred) as latest_date
      FROM cards
    `);

    const stat = stats.rows[0];
    console.log('📊 DATABASE SUMMARY:');
    console.log(`  Total cards: ${stat.total_cards}`);
    console.log(`  Unique titles: ${stat.unique_titles}`);
    console.log(`  Unique dates: ${stat.unique_dates}`);
    console.log(`  Unique categories: ${stat.unique_categories}`);
    console.log(`  Date range: ${stat.earliest_date} to ${stat.latest_date}`);
    
    if (stat.total_cards !== stat.unique_titles) {
      console.log(`  ⚠️  Potential duplicates: ${stat.total_cards - stat.unique_titles} cards have duplicate titles`);
    }

  } catch (error) {
    console.error('❌ Error checking for duplicates:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the check
if (require.main === module) {
  checkDuplicateCards().catch(console.error);
}

module.exports = { checkDuplicateCards }; 