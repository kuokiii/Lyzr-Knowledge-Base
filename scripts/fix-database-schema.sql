-- Fix the activity_items table to add the missing icon column
ALTER TABLE activity_items ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT 'Upload';

-- Fix the documents table to ensure uploaded_at has a proper default
ALTER TABLE documents ALTER COLUMN uploaded_at SET DEFAULT NOW();

-- Update any existing records that might have null uploaded_at
UPDATE documents SET uploaded_at = created_at WHERE uploaded_at IS NULL;

-- Ensure the constraint is properly set
ALTER TABLE documents ALTER COLUMN uploaded_at SET NOT NULL;
