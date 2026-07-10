-- -----------------------------------------------------------------------------
-- Drip AI Database Schema Setup
-- Run this in your Supabase SQL Editor to initialize Sprint 2 tables
-- -----------------------------------------------------------------------------

-- 1. Create Outfit History Table
CREATE TABLE IF NOT EXISTS public.outfit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    prompt_text TEXT NOT NULL,
    outfit_name TEXT NOT NULL,
    style_explanation TEXT NOT NULL,
    color_palette TEXT[] NOT NULL DEFAULT '{}',
    items JSONB NOT NULL, -- Standardized shopping items coordinates
    total_cost NUMERIC NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for outfit history
ALTER TABLE public.outfit_history ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for outfit history
DROP POLICY IF EXISTS "Users can manage their own outfit history" ON public.outfit_history;
CREATE POLICY "Users can manage their own outfit history" 
    ON public.outfit_history 
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Create index for quick user lookup
CREATE INDEX IF NOT EXISTS idx_outfit_history_user_id ON public.outfit_history(user_id);


-- 2. Create Saved Closets Table
CREATE TABLE IF NOT EXISTS public.saved_closets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of trial closet items
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security (RLS) for saved closets
ALTER TABLE public.saved_closets ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies for saved closets
DROP POLICY IF EXISTS "Users can manage their own saved closet" ON public.saved_closets;
CREATE POLICY "Users can manage their own saved closet" 
    ON public.saved_closets 
    FOR ALL 
    TO authenticated 
    USING (auth.uid() = user_id) 
    WITH CHECK (auth.uid() = user_id);

-- Create index for user lookup
CREATE INDEX IF NOT EXISTS idx_saved_closets_user_id ON public.saved_closets(user_id);
