-- Migration: 002_sample_data.sql
-- Description: Populate cards table with sample historical events
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Clear existing data (if any) to avoid duplicates
TRUNCATE TABLE cards RESTART IDENTITY CASCADE;

-- Insert sample historical events
INSERT INTO cards (title, date_occurred, category, difficulty, description) VALUES
('World War II ends', '1945-09-02', 'History', 1, 'Japan formally surrendered aboard the USS Missouri in Tokyo Bay'),
('First Moon Landing', '1969-07-20', 'Space', 2, 'Apollo 11 mission successfully lands Neil Armstrong and Buzz Aldrin on the moon'),
('Berlin Wall falls', '1989-11-09', 'History', 1, 'The barrier dividing East and West Berlin is torn down'),
('iPhone is released', '2007-06-29', 'Technology', 1, 'Apple releases the first iPhone, revolutionizing smartphones'),
('Titanic sinks', '1912-04-15', 'History', 2, 'The RMS Titanic sinks on its maiden voyage'),
('Wright Brothers first flight', '1903-12-17', 'Aviation', 2, 'First powered, sustained, and controlled heavier-than-air human flight'),
('World Wide Web invented', '1989-03-12', 'Technology', 2, 'Tim Berners-Lee proposes the World Wide Web'),
('Discovery of DNA structure', '1953-04-25', 'Science', 3, 'Watson and Crick publish their discovery of DNA''s double helix structure'),
('Fall of Roman Empire', '0476-09-04', 'History', 3, 'The last Western Roman Emperor is deposed'),
('Printing Press invented', '1440-01-01', 'Technology', 2, 'Johannes Gutenberg invents the printing press with movable type'),
('Steam Engine invented', '1712-01-01', 'Technology', 2, 'Thomas Newcomen builds the first practical steam engine'),
('American Civil War ends', '1865-04-09', 'History', 2, 'Confederate General Lee surrenders to Union General Grant');

-- Verify the data was inserted correctly
SELECT 
    COUNT(*) as total_cards,
    COUNT(DISTINCT category) as unique_categories,
    MIN(date_occurred) as earliest_date,
    MAX(date_occurred) as latest_date
FROM cards; 