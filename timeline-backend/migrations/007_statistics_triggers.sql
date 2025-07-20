-- Migration: 007_statistics_triggers.sql
-- Description: Add missing columns for leaderboards and create triggers for statistics updates
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Add missing columns to player_statistics table
ALTER TABLE player_statistics 
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0;

-- Add missing columns to category_statistics table
ALTER TABLE category_statistics 
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add missing columns to daily_statistics table
ALTER TABLE daily_statistics 
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00;

-- Add missing columns to weekly_statistics table
ALTER TABLE weekly_statistics 
ADD COLUMN IF NOT EXISTS win_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS week_start_date DATE;

-- Update existing records to calculate win_rate
UPDATE player_statistics 
SET win_rate = CASE 
  WHEN total_games_played > 0 THEN ROUND((total_games_won::DECIMAL / total_games_played) * 100, 2)
  ELSE 0.00
END;

UPDATE category_statistics 
SET win_rate = CASE 
  WHEN games_played > 0 THEN ROUND((games_won::DECIMAL / games_played) * 100, 2)
  ELSE 0.00
END;

UPDATE daily_statistics 
SET win_rate = CASE 
  WHEN games_played > 0 THEN ROUND((games_won::DECIMAL / games_played) * 100, 2)
  ELSE 0.00
END;

UPDATE weekly_statistics 
SET win_rate = CASE 
  WHEN games_played > 0 THEN ROUND((games_won::DECIMAL / games_played) * 100, 2)
  ELSE 0.00
END,
week_start_date = DATE_TRUNC('week', CURRENT_DATE - (week * 7 || ' days')::INTERVAL);

-- Create function to update win_rate automatically
CREATE OR REPLACE FUNCTION update_win_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Update win_rate for player_statistics
  IF TG_TABLE_NAME = 'player_statistics' THEN
    NEW.win_rate = CASE 
      WHEN NEW.total_games_played > 0 THEN ROUND((NEW.total_games_won::DECIMAL / NEW.total_games_played) * 100, 2)
      ELSE 0.00
    END;
  END IF;
  
  -- Update win_rate for category_statistics
  IF TG_TABLE_NAME = 'category_statistics' THEN
    NEW.win_rate = CASE 
      WHEN NEW.games_played > 0 THEN ROUND((NEW.games_won::DECIMAL / NEW.games_played) * 100, 2)
      ELSE 0.00
    END;
  END IF;
  
  -- Update win_rate for daily_statistics
  IF TG_TABLE_NAME = 'daily_statistics' THEN
    NEW.win_rate = CASE 
      WHEN NEW.games_played > 0 THEN ROUND((NEW.games_won::DECIMAL / NEW.games_played) * 100, 2)
      ELSE 0.00
    END;
  END IF;
  
  -- Update win_rate for weekly_statistics
  IF TG_TABLE_NAME = 'weekly_statistics' THEN
    NEW.win_rate = CASE 
      WHEN NEW.games_played > 0 THEN ROUND((NEW.games_won::DECIMAL / NEW.games_played) * 100, 2)
      ELSE 0.00
    END;
    NEW.week_start_date = DATE_TRUNC('week', CURRENT_DATE - (NEW.week * 7 || ' days')::INTERVAL);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update win_rate
DROP TRIGGER IF EXISTS update_player_statistics_win_rate ON player_statistics;
CREATE TRIGGER update_player_statistics_win_rate 
    BEFORE INSERT OR UPDATE ON player_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_win_rate();

DROP TRIGGER IF EXISTS update_category_statistics_win_rate ON category_statistics;
CREATE TRIGGER update_category_statistics_win_rate 
    BEFORE INSERT OR UPDATE ON category_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_win_rate();

DROP TRIGGER IF EXISTS update_daily_statistics_win_rate ON daily_statistics;
CREATE TRIGGER update_daily_statistics_win_rate 
    BEFORE INSERT OR UPDATE ON daily_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_win_rate();

DROP TRIGGER IF EXISTS update_weekly_statistics_win_rate ON weekly_statistics;
CREATE TRIGGER update_weekly_statistics_win_rate 
    BEFORE INSERT OR UPDATE ON weekly_statistics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_win_rate();

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_player_statistics_win_rate ON player_statistics(win_rate);
CREATE INDEX IF NOT EXISTS idx_category_statistics_win_rate ON category_statistics(win_rate);
CREATE INDEX IF NOT EXISTS idx_daily_statistics_win_rate ON daily_statistics(win_rate);
CREATE INDEX IF NOT EXISTS idx_weekly_statistics_win_rate ON weekly_statistics(win_rate);
CREATE INDEX IF NOT EXISTS idx_weekly_statistics_week_start_date ON weekly_statistics(week_start_date);

-- Add comments for documentation
COMMENT ON COLUMN player_statistics.win_rate IS 'Win rate as percentage (0-100)';
COMMENT ON COLUMN player_statistics.longest_streak IS 'Longest winning streak';
COMMENT ON COLUMN category_statistics.win_rate IS 'Win rate as percentage (0-100)';
COMMENT ON COLUMN daily_statistics.win_rate IS 'Win rate as percentage (0-100)';
COMMENT ON COLUMN weekly_statistics.win_rate IS 'Win rate as percentage (0-100)';
COMMENT ON COLUMN weekly_statistics.week_start_date IS 'Start date of the week'; 