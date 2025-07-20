-- Migration: 008_cleanup_duplicates.sql
-- Description: Clean up any remaining duplicate cards in the database and standardize similar titles
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- First, let's see what duplicates exist in the database
-- This will help us understand what needs to be cleaned up

-- Check for exact duplicates (same title and date)
SELECT 
    title, 
    date_occurred, 
    COUNT(*) as count,
    array_agg(id) as card_ids
FROM cards 
GROUP BY title, date_occurred 
HAVING COUNT(*) > 1
ORDER BY count DESC, title;

-- Check for similar titles that might be duplicates
SELECT 
    c1.title as title1, 
    c1.date_occurred as date1, 
    c1.id as id1,
    c2.title as title2, 
    c2.date_occurred as date2, 
    c2.id as id2
FROM cards c1
JOIN cards c2 ON c1.id < c2.id
WHERE (
    -- Check for similar titles (case insensitive)
    LOWER(c1.title) = LOWER(c2.title) OR
    -- Check for titles that are very similar (one contains the other)
    LOWER(c1.title) LIKE LOWER(c2.title) || '%' OR
    LOWER(c2.title) LIKE LOWER(c1.title) || '%'
)
AND c1.date_occurred = c2.date_occurred
ORDER BY c1.title, c2.title;

-- Remove exact duplicates, keeping the one with the most detailed description
-- For each group of duplicates, we'll keep the card with the longest description
-- and remove the others

-- Create a temporary table to identify which cards to keep
CREATE TEMP TABLE cards_to_keep AS
SELECT DISTINCT ON (title, date_occurred) 
    id,
    title,
    date_occurred,
    category,
    difficulty,
    description,
    LENGTH(description) as desc_length
FROM cards
ORDER BY title, date_occurred, LENGTH(description) DESC, id;

-- Create a temporary table to identify which cards to remove
CREATE TEMP TABLE cards_to_remove AS
SELECT c.id
FROM cards c
LEFT JOIN cards_to_keep ctk ON c.id = ctk.id
WHERE ctk.id IS NULL;

-- Show what will be removed
SELECT 
    c.title,
    c.date_occurred,
    c.description
FROM cards c
JOIN cards_to_remove ctr ON c.id = ctr.id
ORDER BY c.title, c.date_occurred;

-- Remove the duplicate cards
DELETE FROM cards 
WHERE id IN (SELECT id FROM cards_to_remove);

-- Clean up temporary tables
DROP TABLE cards_to_keep;
DROP TABLE cards_to_remove;

-- Standardize similar titles
-- Update "Columbus reaches America" to "Christopher Columbus reaches Americas" for consistency
UPDATE cards 
SET title = 'Christopher Columbus reaches Americas'
WHERE title = 'Columbus reaches America' 
AND date_occurred = '1492-10-12';

-- Remove the duplicate Christopher Columbus entry (keep the one with more detailed description)
DELETE FROM cards 
WHERE id IN (
    SELECT id FROM (
        SELECT id, 
               ROW_NUMBER() OVER (PARTITION BY title, date_occurred ORDER BY LENGTH(description) DESC, id) as rn
        FROM cards 
        WHERE title = 'Christopher Columbus reaches Americas' 
        AND date_occurred = '1492-10-12'
    ) ranked 
    WHERE rn > 1
);

-- Verify the cleanup
SELECT 
    COUNT(*) as total_cards,
    COUNT(DISTINCT title) as unique_titles,
    COUNT(DISTINCT date_occurred) as unique_dates,
    MIN(date_occurred) as earliest_date,
    MAX(date_occurred) as latest_date
FROM cards;

-- Show final card count by category
SELECT 
    category,
    COUNT(*) as card_count
FROM cards
GROUP BY category
ORDER BY card_count DESC;

-- Show final card count by difficulty
SELECT 
    difficulty,
    COUNT(*) as card_count
FROM cards
GROUP BY difficulty
ORDER BY difficulty; 