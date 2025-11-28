-- Create table to track IP-based quiz generation limits
CREATE TABLE IF NOT EXISTS public.ip_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  generation_count INTEGER DEFAULT 1,
  first_generation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_generation_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on ip_address for faster lookups
CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_ip_address ON public.ip_rate_limits(ip_address);

-- Create index on last_generation_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_ip_rate_limits_last_generation ON public.ip_rate_limits(last_generation_at);

-- Enable RLS
ALTER TABLE public.ip_rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage rate limits (edge functions will use service role)
CREATE POLICY "Service role can manage rate limits"
  ON public.ip_rate_limits
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);