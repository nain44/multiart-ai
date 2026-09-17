-- Adds the seasonal/holiday event_date column to an already-deployed categories table.
-- Run this once against the production database (schema.sql already has it for fresh installs).
ALTER TABLE categories
  ADD COLUMN event_date VARCHAR(10) NULL AFTER description;
