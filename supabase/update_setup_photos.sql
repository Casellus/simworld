-- ================================================================
-- Aggiorna le foto degli assetti demo con immagini reali Wikimedia
-- (licenze Creative Commons, uso libero con attribuzione)
-- Esegui nell'SQL Editor di Supabase Dashboard
-- ================================================================

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/5/5f/2023_Ferrari_296_GT3_Daytona.jpg'
WHERE title = 'Ferrari 296 GT3 – Monza Qualifying';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/4/44/2024_6_Hours_of_Spa-Francorchamps_Iron_Dames_Lamborghini_Hurac%C3%A1n_GT3_Evo2_No.85_%28DSC02627%29.jpg'
WHERE title = 'Lamborghini Huracán GT3 EVO2 – Spa Gara';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/8/86/BMW_M4_GT3_%28GTD_Class_-1%29_%2852226831512%29.jpg'
WHERE title = 'BMW M4 GT3 – Nürburgring GP Qualifica';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c4/No.720_McLaren_720S_GT3_%282%29.jpg'
WHERE title = 'McLaren 720S GT3 EVO – Paul Ricard Time Attack';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Porsche_911_992_GT3_RS_SSR_RS.jpg'
WHERE title = 'Porsche 911 GT3 RS – Mugello Hotlap';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Ferrari_499P.png'
WHERE title = 'Ferrari 499P – Laguna Seca Qualifica';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c6/United_Autosports_Audi_R8_LMS_Ultra_GT3.jpg'
WHERE title = 'Audi R8 LMS GT3 – Imola Gara';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/d/da/Dallara_f3_2019.jpg'
WHERE title = 'Dallara F3 – Silverstone GP Qualifica';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Porsche_911_992_GT3_Cup.jpg'
WHERE title = 'Porsche 911 GT3 Cup – Nürburgring GP Tire Management';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Ferrari_499P.png'
WHERE title = 'Ferrari 499P – Le Mans 24h Setup Endurance';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/5/52/Ferrari_F2004_F1_Michael_Schumachers_2004_AboveNose_tall_CECF_9April2011_%2814414284438%29.jpg'
WHERE title = 'Ferrari F2004 – Monza Time Attack';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/c/c5/%2716_Mazda_MX-5_Competition_Car_%28MIAS_%2716%29.jpg'
WHERE title = 'Mazda MX-5 Cup – Nordschleife Hotlap';

UPDATE setups SET photo_url = 'https://upload.wikimedia.org/wikipedia/commons/1/14/Mercedes-AMG_F1_W16_E_Performance_%2855060466583%29.jpg'
WHERE title = 'Mercedes W16 – Monaco Qualifica';
