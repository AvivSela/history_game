-- Migration: 002_sample_data.sql
-- Description: Populate cards table with sample historical events
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Clear existing data (if any) to avoid duplicates
TRUNCATE TABLE cards RESTART IDENTITY CASCADE;

-- Insert sample historical events
INSERT INTO cards (title, date_occurred, category, difficulty, description) VALUES
('iPhone is released', '2007-06-29', 'Technology', 1, 'Apple releases the first iPhone, revolutionizing smartphones'),
('Discovery of DNA structure', '1953-04-25', 'Science', 3, 'Watson and Crick publish their discovery of DNA''s double helix structure'),
('Fall of Roman Empire', '0476-09-04', 'History', 3, 'The last Western Roman Emperor is deposed'),
('Printing Press invented', '1440-01-01', 'Technology', 2, 'Johannes Gutenberg invents the printing press with movable type'),
('Steam Engine invented', '1712-01-01', 'Technology', 2, 'Thomas Newcomen builds the first practical steam engine'),;

-- Verify the data was inserted correctly
SELECT 
    COUNT(*) as total_cards,
    COUNT(DISTINCT category) as unique_categories,
    MIN(date_occurred) as earliest_date,
    MAX(date_occurred) as latest_date
FROM cards; 