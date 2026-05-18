-- Aggiunge il tipo di assetto (auto o simulatore) e la categoria per i simulatori
-- Esegui nell'SQL Editor di Supabase Dashboard

ALTER TABLE setups
  ADD COLUMN IF NOT EXISTS setup_type text NOT NULL DEFAULT 'auto'
    CHECK (setup_type IN ('auto', 'simulatore'));

ALTER TABLE setups
  ADD COLUMN IF NOT EXISTS category text;
