-- Critical Security Fixes

-- 1. Add INSERT policy to profiles table (CRITICAL - allows new users to create their profile)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Add DELETE policy to quiz_attempts table (fixes Dashboard delete functionality)
CREATE POLICY "Users can delete their own attempts" 
ON public.quiz_attempts 
FOR DELETE 
USING (auth.uid() = user_id);

-- 3. Add UPDATE policy to quizzes table (allows users to edit their quizzes)
CREATE POLICY "Users can update their own quizzes" 
ON public.quizzes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Add DELETE policy to profiles table (GDPR compliance - allows users to delete their data)
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = id);