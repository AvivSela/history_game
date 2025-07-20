-- Migration: 000_migration_tracking.sql
-- Description: Create migration tracking table for version control
-- Created: 2024-01-XX
-- Author: Timeline Game Team

-- Create migration tracking table
CREATE TABLE IF NOT EXISTS migrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64), -- For future validation
    execution_time_ms INTEGER -- Track migration performance
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations(name);
CREATE INDEX IF NOT EXISTS idx_migrations_executed_at ON migrations(executed_at);

-- Add comments for documentation
COMMENT ON TABLE migrations IS 'Tracks which database migrations have been applied';
COMMENT ON COLUMN migrations.name IS 'Name of the migration file (e.g., 001_initial_schema.sql)';
COMMENT ON COLUMN migrations.executed_at IS 'When the migration was executed';
COMMENT ON COLUMN migrations.checksum IS 'SHA256 checksum of migration file for validation';
COMMENT ON COLUMN migrations.execution_time_ms IS 'Time taken to execute migration in milliseconds'; 