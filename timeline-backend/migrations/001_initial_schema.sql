-- Migration: 001_initial_schema.sql
-- Description: Initial database schema for Timeline Game
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Enable UUID extension for better ID management
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create cards table to store historical events
CREATE TABLE IF NOT EXISTS cards (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date_occurred DATE NOT NULL,
    category VARCHAR(100) NOT NULL,
    difficulty INTEGER NOT NULL CHECK (difficulty >= 1 AND difficulty <= 5),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);
CREATE INDEX IF NOT EXISTS idx_cards_difficulty ON cards(difficulty);
CREATE INDEX IF NOT EXISTS idx_cards_date_occurred ON cards(date_occurred);
CREATE INDEX IF NOT EXISTS idx_cards_created_at ON cards(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
CREATE TRIGGER update_cards_updated_at 
    BEFORE UPDATE ON cards 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE cards IS 'Stores historical events/cards for the Timeline game';
COMMENT ON COLUMN cards.id IS 'Unique identifier for the card';
COMMENT ON COLUMN cards.title IS 'Title/name of the historical event';
COMMENT ON COLUMN cards.date_occurred IS 'Date when the event occurred';
COMMENT ON COLUMN cards.category IS 'Category of the event (History, Technology, Science, etc.)';
COMMENT ON COLUMN cards.difficulty IS 'Difficulty level from 1 (easy) to 5 (hard)';
COMMENT ON COLUMN cards.description IS 'Detailed description of the event';
COMMENT ON COLUMN cards.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN cards.updated_at IS 'Timestamp when the record was last updated'; 