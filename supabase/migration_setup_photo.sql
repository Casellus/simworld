-- ================================================================
-- MIGRAZIONE: aggiunta colonna photo_url alla tabella setups
-- Esegui nell'SQL Editor di Supabase Dashboard
-- ================================================================

ALTER TABLE setups ADD COLUMN IF NOT EXISTS photo_url text;

-- ================================================================
-- Aggiunge foto placeholder agli assetti demo (casellus_1)
-- Sostituibili con immagini reali tramite il form Modifica assetto
-- ================================================================

UPDATE setups SET photo_url = 'https://picsum.photos/seed/ferrari-gt3-monza/800/450'
WHERE title = 'Ferrari 296 GT3 – Monza Qualifying';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/lambo-spa-gt3/800/450'
WHERE title = 'Lamborghini Huracán GT3 EVO2 – Spa Gara';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/bmw-m4-nring/800/450'
WHERE title = 'BMW M4 GT3 – Nürburgring GP Qualifica';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/mclaren-paul-ricard/800/450'
WHERE title = 'McLaren 720S GT3 EVO – Paul Ricard Time Attack';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/porsche-gt3-mugello/800/450'
WHERE title = 'Porsche 911 GT3 RS – Mugello Hotlap';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/ferrari499p-laguna/800/450'
WHERE title = 'Ferrari 499P – Laguna Seca Qualifica';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/audi-r8-imola/800/450'
WHERE title = 'Audi R8 LMS GT3 – Imola Gara';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/dallara-f3-silver/800/450'
WHERE title = 'Dallara F3 – Silverstone GP Qualifica';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/porsche-cup-nring/800/450'
WHERE title = 'Porsche 911 GT3 Cup – Nürburgring GP Tire Management';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/ferrari499p-lemans/800/450'
WHERE title = 'Ferrari 499P – Le Mans 24h Setup Endurance';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/ferrari-f2004-monza/800/450'
WHERE title = 'Ferrari F2004 – Monza Time Attack';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/mazda-mx5-nordschleife/800/450'
WHERE title = 'Mazda MX-5 Cup – Nordschleife Hotlap';

UPDATE setups SET photo_url = 'https://picsum.photos/seed/mercedes-w16-monaco/800/450'
WHERE title = 'Mercedes W16 – Monaco Qualifica';
