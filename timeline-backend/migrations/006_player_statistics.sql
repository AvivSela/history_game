-- Migration: 006_player_statistics.sql
-- Description: Player statistics and analytics schema for Phase 3
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Create player_statistics table to track aggregated player performance
CREATE TABLE IF NOT EXISTS player_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL UNIQUE,
    total_games_played INTEGER DEFAULT 0,
    total_games_won INTEGER DEFAULT 0,
    total_games_lost INTEGER DEFAULT 0,
    total_games_abandoned INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    total_correct_moves INTEGER DEFAULT 0,
    total_incorrect_moves INTEGER DEFAULT 0,
    total_play_time_seconds INTEGER DEFAULT 0,
    average_score_per_game DECIMAL(5,2) DEFAULT 0.00,
    average_accuracy DECIMAL(5,2) DEFAULT 0.00, -- correct_moves / total_moves
    best_score INTEGER DEFAULT 0,
    worst_score INTEGER DEFAULT 0,
    average_game_duration_seconds INTEGER DEFAULT 0,
    favorite_difficulty INTEGER DEFAULT 1,
    favorite_categories TEXT[] DEFAULT '{}',
    last_played_at TIMESTAMP WITH TIME ZONE,
    first_played_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create category_statistics table to track player performance by category
CREATE TABLE IF NOT EXISTS category_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    correct_moves INTEGER DEFAULT 0,
    incorrect_moves INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    best_score INTEGER DEFAULT 0,
    average_game_duration_seconds INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_name, category)
);

-- Create difficulty_statistics table to track player performance by difficulty level
CREATE TABLE IF NOT EXISTS difficulty_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    correct_moves INTEGER DEFAULT 0,
    incorrect_moves INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    best_score INTEGER DEFAULT 0,
    average_game_duration_seconds INTEGER DEFAULT 0,
    last_played_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_name, difficulty_level)
);

-- Create daily_statistics table to track daily performance trends
CREATE TABLE IF NOT EXISTS daily_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    correct_moves INTEGER DEFAULT 0,
    incorrect_moves INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    total_play_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_name, date)
);

-- Create weekly_statistics table to track weekly performance trends
CREATE TABLE IF NOT EXISTS weekly_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    week INTEGER NOT NULL CHECK (week >= 1 AND week <= 53),
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    correct_moves INTEGER DEFAULT 0,
    incorrect_moves INTEGER DEFAULT 0,
    average_score DECIMAL(5,2) DEFAULT 0.00,
    accuracy DECIMAL(5,2) DEFAULT 0.00,
    total_play_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_name, year, week)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_player_statistics_player_name ON player_statistics(player_name);
CREATE INDEX IF NOT EXISTS idx_player_statistics_total_score ON player_statistics(total_score);
CREATE INDEX IF NOT EXISTS idx_player_statistics_average_score ON player_statistics(average_score_per_game);
CREATE INDEX IF NOT EXISTS idx_player_statistics_last_played_at ON player_statistics(last_played_at);

CREATE INDEX IF NOT EXISTS idx_category_statistics_player_name ON category_statistics(player_name);
CREATE INDEX IF NOT EXISTS idx_category_statistics_category ON category_statistics(category);
CREATE INDEX IF NOT EXISTS idx_category_statistics_accuracy ON category_statistics(accuracy);
CREATE INDEX IF NOT EXISTS idx_category_statistics_average_score ON category_statistics(average_score);

CREATE INDEX IF NOT EXISTS idx_difficulty_statistics_player_name ON difficulty_statistics(player_name);
CREATE INDEX IF NOT EXISTS idx_difficulty_statistics_difficulty ON difficulty_statistics(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_difficulty_statistics_accuracy ON difficulty_statistics(accuracy);
CREATE INDEX IF NOT EXISTS idx_difficulty_statistics_average_score ON difficulty_statistics(average_score);

CREATE INDEX IF NOT EXISTS idx_daily_statistics_player_name ON daily_statistics(player_name);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_date ON daily_statistics(date);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_total_score ON daily_statistics(total_score);

CREATE INDEX IF NOT EXISTS idx_weekly_statistics_player_name ON weekly_statistics(player_name);
CREATE INDEX IF NOT EXISTS idx_weekly_statistics_year_week ON weekly_statistics(year, week);
CREATE INDEX IF NOT EXISTS idx_weekly_statistics_total_score ON weekly_statistics(total_score);

-- Create triggers to automatically update the updated_at timestamp
DROP TRIGGER IF EXISTS update_player_statistics_updated_at ON player_statistics;
CREATE TRIGGER update_player_statistics_updated_at 
    BEFORE UPDATE ON player_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_category_statistics_updated_at ON category_statistics;
CREATE TRIGGER update_category_statistics_updated_at 
    BEFORE UPDATE ON category_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_difficulty_statistics_updated_at ON difficulty_statistics;
CREATE TRIGGER update_difficulty_statistics_updated_at 
    BEFORE UPDATE ON difficulty_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_daily_statistics_updated_at ON daily_statistics;
CREATE TRIGGER update_daily_statistics_updated_at 
    BEFORE UPDATE ON daily_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_weekly_statistics_updated_at ON weekly_statistics;
CREATE TRIGGER update_weekly_statistics_updated_at 
    BEFORE UPDATE ON weekly_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE player_statistics IS 'Aggregated player performance statistics';
COMMENT ON TABLE category_statistics IS 'Player performance statistics by category';
COMMENT ON TABLE difficulty_statistics IS 'Player performance statistics by difficulty level';
COMMENT ON TABLE daily_statistics IS 'Daily player performance trends';
COMMENT ON TABLE weekly_statistics IS 'Weekly player performance trends'; 