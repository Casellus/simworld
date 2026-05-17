-- Aggiorna le foto degli assetti con percorsi locali (serviti da Next.js public/)
-- Esegui nell'SQL Editor di Supabase Dashboard

UPDATE setups SET photo_url = '/setup-photos/ferrari-296-gt3.jpg'  WHERE title = 'Ferrari 296 GT3 – Monza Qualifying';
UPDATE setups SET photo_url = '/setup-photos/lamborghini-huracan.jpg' WHERE title = 'Lamborghini Huracán GT3 EVO2 – Spa Gara';
UPDATE setups SET photo_url = '/setup-photos/bmw-m4-gt3.jpg'       WHERE title = 'BMW M4 GT3 – Nürburgring GP Qualifica';
UPDATE setups SET photo_url = '/setup-photos/mclaren-720s-gt3.jpg' WHERE title = 'McLaren 720S GT3 EVO – Paul Ricard Time Attack';
UPDATE setups SET photo_url = '/setup-photos/porsche-911-gt3rs.jpg' WHERE title = 'Porsche 911 GT3 RS – Mugello Hotlap';
UPDATE setups SET photo_url = '/setup-photos/ferrari-499p.jpg'     WHERE title = 'Ferrari 499P – Laguna Seca Qualifica';
UPDATE setups SET photo_url = '/setup-photos/audi-r8-lms.jpg'      WHERE title = 'Audi R8 LMS GT3 – Imola Gara';
UPDATE setups SET photo_url = '/setup-photos/dallara-f3.jpg'       WHERE title = 'Dallara F3 – Silverstone GP Qualifica';
UPDATE setups SET photo_url = '/setup-photos/porsche-911-gt3-cup.jpg' WHERE title = 'Porsche 911 GT3 Cup – Nürburgring GP Tire Management';
UPDATE setups SET photo_url = '/setup-photos/ferrari-499p.jpg'     WHERE title = 'Ferrari 499P – Le Mans 24h Setup Endurance';
UPDATE setups SET photo_url = '/setup-photos/ferrari-f2004.jpg'    WHERE title = 'Ferrari F2004 – Monza Time Attack';
UPDATE setups SET photo_url = '/setup-photos/mazda-mx5.jpg'        WHERE title = 'Mazda MX-5 Cup – Nordschleife Hotlap';
UPDATE setups SET photo_url = '/setup-photos/mercedes-w16.jpg'     WHERE title = 'Mercedes W16 – Monaco Qualifica';
