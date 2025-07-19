-- Migration: 003_game_sessions.sql
-- Description: Game sessions and moves tracking schema
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Create game_sessions table to track individual game sessions
CREATE TABLE IF NOT EXISTS game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_name VARCHAR(100) NOT NULL,
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    card_count INTEGER NOT NULL CHECK (card_count >= 1 AND card_count <= 50),
    categories TEXT[], -- Array of selected categories
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    score INTEGER DEFAULT 0,
    total_moves INTEGER DEFAULT 0,
    correct_moves INTEGER DEFAULT 0,
    incorrect_moves INTEGER DEFAULT 0,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create game_moves table to track individual moves within a session
CREATE TABLE IF NOT EXISTS game_moves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    card_id INTEGER NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    position_before INTEGER, -- Position in timeline before move
    position_after INTEGER, -- Position in timeline after move
    is_correct BOOLEAN NOT NULL,
    move_number INTEGER NOT NULL, -- Sequential move number within session
    time_taken_seconds INTEGER, -- Time taken for this move
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_game_sessions_player_name ON game_sessions(player_name);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time ON game_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_game_sessions_difficulty ON game_sessions(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_game_sessions_score ON game_sessions(score);

CREATE INDEX IF NOT EXISTS idx_game_moves_session_id ON game_moves(session_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_card_id ON game_moves(card_id);
CREATE INDEX IF NOT EXISTS idx_game_moves_is_correct ON game_moves(is_correct);
CREATE INDEX IF NOT EXISTS idx_game_moves_move_number ON game_moves(session_id, move_number);
CREATE INDEX IF NOT EXISTS idx_game_moves_created_at ON game_moves(created_at);

-- Create trigger to automatically update the updated_at timestamp for game_sessions
DROP TRIGGER IF EXISTS update_game_sessions_updated_at ON game_sessions;
CREATE TRIGGER update_game_sessions_updated_at 
    BEFORE UPDATE ON game_sessions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a function to calculate session duration when session ends
CREATE OR REPLACE FUNCTION calculate_session_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('completed', 'abandoned') AND NEW.end_time IS NOT NULL THEN
        NEW.duration_seconds = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time));
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to calculate duration when session ends
DROP TRIGGER IF EXISTS calculate_game_session_duration ON game_sessions;
CREATE TRIGGER calculate_game_session_duration
    BEFORE UPDATE ON game_sessions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_session_duration();

-- Add comments for documentation
COMMENT ON TABLE game_sessions IS 'Tracks individual game sessions for the Timeline game';
COMMENT ON COLUMN game_sessions.id IS 'Unique identifier for the game session';
COMMENT ON COLUMN game_sessions.player_name IS 'Name of the player';
COMMENT ON COLUMN game_sessions.difficulty_level IS 'Difficulty level from 1 (easy) to 5 (hard)';
COMMENT ON COLUMN game_sessions.card_count IS 'Number of cards in this game session';
COMMENT ON COLUMN game_sessions.categories IS 'Array of selected categories for this session';
COMMENT ON COLUMN game_sessions.status IS 'Current status of the game session';
COMMENT ON COLUMN game_sessions.score IS 'Final score achieved in this session';
COMMENT ON COLUMN game_sessions.total_moves IS 'Total number of moves made';
COMMENT ON COLUMN game_sessions.correct_moves IS 'Number of correct moves';
COMMENT ON COLUMN game_sessions.incorrect_moves IS 'Number of incorrect moves';
COMMENT ON COLUMN game_sessions.start_time IS 'When the game session started';
COMMENT ON COLUMN game_sessions.end_time IS 'When the game session ended';
COMMENT ON COLUMN game_sessions.duration_seconds IS 'Total duration of the session in seconds';

COMMENT ON TABLE game_moves IS 'Tracks individual moves within a game session';
COMMENT ON COLUMN game_moves.id IS 'Unique identifier for the move';
COMMENT ON COLUMN game_moves.session_id IS 'Reference to the game session';
COMMENT ON COLUMN game_moves.card_id IS 'Reference to the card being moved';
COMMENT ON COLUMN game_moves.position_before IS 'Position in timeline before the move';
COMMENT ON COLUMN game_moves.position_after IS 'Position in timeline after the move';
COMMENT ON COLUMN game_moves.is_correct IS 'Whether the move was correct';
COMMENT ON COLUMN game_moves.move_number IS 'Sequential number of this move within the session';
COMMENT ON COLUMN game_moves.time_taken_seconds IS 'Time taken for this specific move'; 