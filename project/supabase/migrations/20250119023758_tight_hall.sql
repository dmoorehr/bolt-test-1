/*
  # Add headers column to dashboard_data table

  1. Changes
    - Add `headers` column to store spreadsheet headers
    - Ensure RLS is enabled
    - Ensure policies exist
*/

-- Add headers column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dashboard_data' 
    AND column_name = 'headers'
  ) THEN
    ALTER TABLE dashboard_data ADD COLUMN headers text[] not null default '{}';
  END IF;
END $$;

-- Ensure RLS is enabled (this is idempotent)
ALTER TABLE dashboard_data ENABLE ROW LEVEL SECURITY;

-- Create insert policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboard_data' 
    AND policyname = 'Users can insert their own data'
  ) THEN
    CREATE POLICY "Users can insert their own data"
      ON dashboard_data
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create select policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'dashboard_data' 
    AND policyname = 'Users can read their own data'
  ) THEN
    CREATE POLICY "Users can read their own data"
      ON dashboard_data
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;