-- Phase 2: Fan Engagement Tables
-- Run this in Supabase SQL Editor

-- Man of the Match votes
CREATE TABLE IF NOT EXISTS public.motm_votes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  player_name text NOT NULL,
  team_id text NOT NULL,
  browser_id text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (match_id, browser_id)
);

ALTER TABLE public.motm_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "motm_insert" ON public.motm_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "motm_select" ON public.motm_votes FOR SELECT USING (true);

-- Match predictions
CREATE TABLE IF NOT EXISTS public.predictions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id text NOT NULL,
  home_score_pred integer NOT NULL,
  away_score_pred integer NOT NULL,
  browser_id text NOT NULL,
  nickname text DEFAULT 'Fan' NOT NULL,
  is_correct boolean DEFAULT NULL,
  exact_score boolean DEFAULT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE (match_id, browser_id)
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pred_insert" ON public.predictions FOR INSERT WITH CHECK (true);
CREATE POLICY "pred_select" ON public.predictions FOR SELECT USING (true);
CREATE POLICY "pred_update" ON public.predictions FOR UPDATE USING (true);
