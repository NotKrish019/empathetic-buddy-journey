
-- Create Row Level Security policy for journal_entries
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to only see their own entries
CREATE POLICY "Users can view their own journal entries" 
ON "journal_entries"
FOR SELECT
USING (auth.uid() = user_id);

-- Create policy for users to insert their own entries
CREATE POLICY "Users can insert their own journal entries" 
ON "journal_entries"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own entries
CREATE POLICY "Users can update their own journal entries" 
ON "journal_entries"
FOR UPDATE
USING (auth.uid() = user_id);

-- Create policy for users to delete their own entries
CREATE POLICY "Users can delete their own journal entries" 
ON "journal_entries"
FOR DELETE
USING (auth.uid() = user_id);
