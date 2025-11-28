-- Fix search_path security issue for generate_share_token function
CREATE OR REPLACE FUNCTION generate_share_token()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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