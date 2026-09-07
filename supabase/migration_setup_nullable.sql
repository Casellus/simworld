-- Le configurazioni simulatore non hanno auto/tracciato: car e track devono
-- poter essere NULL. Prima erano NOT NULL (pensate solo per gli assetti auto),
-- il che faceva fallire l'insert dei setup di tipo 'simulatore'.
-- Esegui nell'SQL Editor di Supabase Dashboard.

ALTER TABLE setups ALTER COLUMN car DROP NOT NULL;
ALTER TABLE setups ALTER COLUMN track DROP NOT NULL;
