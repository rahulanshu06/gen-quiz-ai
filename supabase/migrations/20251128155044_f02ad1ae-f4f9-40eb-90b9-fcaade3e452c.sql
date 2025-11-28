-- Create shared_quizzes table for shareable quiz links
CREATE TABLE public.shared_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  share_token TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  view_count INTEGER NOT NULL DEFAULT 0,
  attempt_count INTEGER NOT NULL DEFAULT 0
);

-- Create index for faster token lookups
CREATE INDEX idx_shared_quizzes_token ON public.shared_quizzes(share_token);
CREATE INDEX idx_shared_quizzes_quiz_id ON public.shared_quizzes(quiz_id);

-- Enable RLS
ALTER TABLE public.shared_quizzes ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view shared quizzes by token (for public access)
CREATE POLICY "Anyone can view shared quizzes by token"
  ON public.shared_quizzes
  FOR SELECT
  USING (true);

-- Policy: Users can create shares for their own quizzes
CREATE POLICY "Users can create shares for their own quizzes"
  ON public.shared_quizzes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = shared_quizzes.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Policy: Users can delete their own quiz shares
CREATE POLICY "Users can delete their own quiz shares"
  ON public.shared_quizzes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = shared_quizzes.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Policy: Users can update their own quiz shares
CREATE POLICY "Users can update their own quiz shares"
  ON public.shared_quizzes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = shared_quizzes.quiz_id
      AND quizzes.user_id = auth.uid()
    )
  );

-- Update quiz_attempts table to support guest attempts via shared links
ALTER TABLE public.quiz_attempts 
  ADD COLUMN IF NOT EXISTS shared_quiz_token TEXT,
  ADD COLUMN IF NOT EXISTS guest_name TEXT;

-- Create index for shared quiz token lookups
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_shared_token 
  ON public.quiz_attempts(shared_quiz_token);

-- Drop existing RLS policies on quiz_attempts that prevent guest access
DROP POLICY IF EXISTS "Users can create their own attempts" ON public.quiz_attempts;
DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts;

-- New policy: Users can view their own attempts OR attempts on their shared quizzes
CREATE POLICY "Users can view their own attempts or shared quiz attempts"
  ON public.quiz_attempts
  FOR SELECT
  USING (
    auth.uid() = user_id 
    OR 
    EXISTS (
      SELECT 1 FROM public.shared_quizzes sq
      JOIN public.quizzes q ON sq.quiz_id = q.id
      WHERE sq.share_token = quiz_attempts.shared_quiz_token
      AND q.user_id = auth.uid()
    )
  );

-- New policy: Anyone can create attempts (for logged in users or guests via shared links)
CREATE POLICY "Anyone can create quiz attempts"
  ON public.quiz_attempts
  FOR INSERT
  WITH CHECK (
    -- Either user is authenticated and creating their own attempt
    (auth.uid() = user_id AND shared_quiz_token IS NULL)
    OR
    -- Or it's a guest attempt via shared link
    (shared_quiz_token IS NOT NULL)
  );

-- Function to generate a unique share token
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 12-character alphanumeric token
    token := substring(md5(random()::text || clock_timestamp()::text) from 1 for 12);
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.shared_quizzes WHERE share_token = token) INTO token_exists;
    
    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;
  
  RETURN token;
END;
$$;