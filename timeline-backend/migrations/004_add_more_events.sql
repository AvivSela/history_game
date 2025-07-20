-- Migration: 004_add_more_events.sql
-- Description: Add more historical events to expand the card pool
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Add more historical events to expand the game
INSERT INTO cards (title, date_occurred, category, difficulty, description) VALUES
-- Ancient History
('Pyramids of Giza built', '02560-01-01', 'History', 3, 'Construction of the Great Pyramid of Giza begins'),
('Alexander the Great dies', '0323-06-10', 'History', 3, 'Alexander the Great dies in Babylon at age 32'),

-- Medieval Period
('Battle of Hastings', '1066-10-14', 'History', 2, 'William the Conqueror defeats King Harold II of England'),
('Black Death begins', '1347-01-01', 'History', 2, 'The Black Death plague begins spreading in Europe'),

-- Renaissance & Exploration
('Leonardo da Vinci paints Mona Lisa', '1503-01-01', 'Cultural', 3, 'Leonardo da Vinci begins painting the Mona Lisa'),
('Shakespeare writes Hamlet', '1600-01-01', 'Cultural', 2, 'William Shakespeare writes his famous play Hamlet'),

-- Industrial Revolution
('Industrial Revolution begins', '1760-01-01', 'Technology', 2, 'The Industrial Revolution begins in Great Britain'),
('First steam locomotive', '1804-02-21', 'Technology', 2, 'Richard Trevithick builds the first steam locomotive'),
('First photograph taken', '1826-01-01', 'Technology', 2, 'Joseph Nicéphore Niépce takes the first photograph'),

-- 19th Century
('First telephone call', '1876-03-10', 'Technology', 2, 'Alexander Graham Bell makes the first telephone call'),
('First electric light bulb', '1879-10-21', 'Technology', 2, 'Thomas Edison demonstrates the first practical light bulb'),

-- Early 20th Century
('First powered flight', '1903-12-17', 'Aviation', 2, 'Wright brothers make the first powered, controlled flight'),
('Russian Revolution', '1917-11-07', 'History', 2, 'The Bolshevik Revolution begins in Russia'),
('Women get right to vote in US', '1920-08-18', 'History', 2, '19th Amendment gives women the right to vote in the US'),

-- Mid 20th Century
('D-Day invasion', '1944-06-06', 'History', 2, 'Allied forces land on Normandy beaches'),
('Atomic bombs dropped on Japan', '1945-08-06', 'History', 2, 'US drops atomic bombs on Hiroshima and Nagasaki'),

-- Space Age
('Sputnik launched', '1957-10-04', 'Space', 2, 'Soviet Union launches the first artificial satellite'),
('First human in space', '1961-04-12', 'Space', 2, 'Yuri Gagarin becomes the first human in space'),
('Cuban Missile Crisis', '1962-10-16', 'History', 2, '13-day confrontation between US and Soviet Union'),
('Martin Luther King Jr. assassinated', '1968-04-04', 'History', 2, 'Civil rights leader Martin Luther King Jr. is assassinated'),

-- Modern Era
('Soviet Union collapses', '1991-12-26', 'History', 2, 'The Soviet Union officially dissolves'),
('9/11 attacks', '2001-09-11', 'History', 1, 'Terrorist attacks on the World Trade Center and Pentagon'),
('First iPhone released', '2007-06-29', 'Technology', 1, 'Apple releases the first iPhone'),
('Barack Obama elected', '2008-11-04', 'History', 1, 'Barack Obama becomes the first African American US President'),
('COVID-19 pandemic begins', '2020-03-11', 'History', 1, 'WHO declares COVID-19 a global pandemic');

-- Verify the new data
SELECT 
    COUNT(*) as total_cards,
    COUNT(DISTINCT category) as unique_categories,
    MIN(date_occurred) as earliest_date,
    MAX(date_occurred) as latest_date
FROM cards; 