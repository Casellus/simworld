-- ================================================================
-- SEED: Assetti demo per SimUniverse
-- Incolla questo script nell'SQL Editor di Supabase Dashboard.
-- Tutti gli assetti vengono attribuiti all'utente "casellus_1".
-- ================================================================

DO $$
DECLARE
  uid   uuid;
  g_acc   uuid;
  g_ac    uuid;
  g_acevo uuid;
  g_iracing uuid;
  g_lmu   uuid;
  g_f1    uuid;
BEGIN
  -- Recupera l'id utente
  SELECT id INTO uid FROM profiles WHERE username = 'casellus_1';
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Utente casellus_1 non trovato';
  END IF;

  -- Recupera i game_id
  SELECT id INTO g_acc    FROM games WHERE slug = 'acc';
  SELECT id INTO g_ac     FROM games WHERE slug = 'ac';
  SELECT id INTO g_acevo  FROM games WHERE slug = 'ac-evo';
  SELECT id INTO g_iracing FROM games WHERE slug = 'iracing';
  SELECT id INTO g_lmu    FROM games WHERE slug = 'lmu';
  SELECT id INTO g_f1     FROM games WHERE slug = 'f1-25';

  -- ── ASSETTO CORSA COMPETIZIONE ──────────────────────────────────

  INSERT INTO setups (user_id, game_id, title, car, track, conditions, notes, downloads, rating_sum, rating_count, created_at) VALUES
  (uid, g_acc,
   'Ferrari 296 GT3 – Monza Qualifying',
   'Ferrari 296 GT3', 'Monza',
   'Asciutto 26°C – Qualifica',
   E'Setup bilanciato per la qualifica a Monza. Ala bassa per massimizzare la velocità di punta sul rettilineo principale e nel tratto delle curve veloci.\n\n'
   'Sospensioni:\n- Anteriori: molla 155.000, bump 4, rebound 6, altezza 52 mm\n- Posteriori: molla 145.000, bump 3, rebound 5, altezza 56 mm\n\n'
   'Aerodinamica:\n- Ala anteriore: 3 | Ala posteriore: 2\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 26,5 PSI / Post 26,8 PSI\n- Compound: Slick\n\n'
   'Freni:\n- Bias: 58,5% | Pad: 1\n- ABS: 95 | TC1: 4 | TC2: 3\n\n'
   'Differenziale:\n- Preload: 90 Nm | Coast: 22%\n\n'
   'Note guida: in frenata alla Prima Variante punta al cordolo interno, sfrutta tutta la larghezza in uscita. Stacca tardi alla Parabolica.',
   47, 12, 14,
   now() - interval '8 days'),

  (uid, g_acc,
   'Lamborghini Huracán GT3 EVO2 – Spa Gara',
   'Lamborghini Huracán GT3 EVO2', 'Spa-Francorchamps',
   'Variabile 18-22°C – Gara 3h',
   E'Setup per gara endurance a Spa. Compromesso tra percorrenza e durata gomme, ottimizzato per stint da 30 minuti.\n\n'
   'Sospensioni:\n- Ant: molla 130.000, bump 5, rebound 7, altezza 54 mm\n- Post: molla 120.000, bump 4, rebound 6, altezza 58 mm\n\n'
   'Aerodinamica:\n- Ala ant: 5 | Ala post: 5 (carico medio per Raidillon)\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 27,0 PSI / Post 27,2 PSI\n- Compound: Slick (cambio in DHE se piove)\n\n'
   'Freni:\n- Bias: 57,8% | Pad: 3 (gara lunga)\n- ABS: 90 | TC1: 5 | TC2: 4\n\n'
   'Differenziale:\n- Preload: 70 Nm | Coast: 18%\n\n'
   'Note guida: risparmia gomme anteriori nelle prime curve del T1. Su Raidillon tieni il gas al 90% se la pista è verde.',
   83, 21, 25,
   now() - interval '15 days'),

  (uid, g_acc,
   'BMW M4 GT3 – Nürburgring GP Qualifica',
   'BMW M4 GT3', 'Nürburgring GP',
   'Asciutto 20°C – Qualifica',
   E'Ottimo bilanciamento per il layout GP del Nürburgring, che richiede un setup polivalente: sia veloce nei tratti veloci che stabile nelle chicane strette.\n\n'
   'Sospensioni:\n- Ant: molla 148.000, ARB 4, altezza 53 mm\n- Post: molla 138.000, ARB 3, altezza 57 mm\n\n'
   'Aerodinamica:\n- Ala ant: 4 | Ala post: 4\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 26,8 PSI / Post 27,0 PSI\n\n'
   'Freni:\n- Bias: 59,0% | ABS: 93 | TC1: 3\n\n'
   'Note guida: la BMW tende al sovrasterzo in trazione; aumenta TC2 a 4 se esci largo dalla Bus Stop.',
   31, 8, 10,
   now() - interval '20 days'),

  (uid, g_acc,
   'McLaren 720S GT3 EVO – Paul Ricard Time Attack',
   'McLaren 720S GT3 EVO', 'Circuit Paul Ricard',
   'Asciutto 30°C – Time Attack',
   E'Setup estremo da time attack per Paul Ricard, pista con lunghi rettilinei e curve veloci.\n\n'
   'Aerodinamica: carico minimo possibile (ant 2 / post 2) per massimizzare la velocità sul Mistral.\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 26,2 PSI / Post 26,5 PSI (la temperatura alta gonfia le coperture)\n\n'
   'Freni:\n- Bias: 60,0% | ABS: 97 | TC1: 2 | TC2: 2\n\n'
   'Note guida: attenzione alla zona T1–T2, il grip è basso se la pista non è "in gomma". Effettua almeno 2 giri di riscaldamento.',
   19, 5, 6,
   now() - interval '5 days'),

  -- ── ASSETTO CORSA EVO ───────────────────────────────────────────

  (uid, g_acevo,
   'Porsche 911 GT3 RS – Mugello Hotlap',
   'Porsche 911 GT3 RS', 'Mugello',
   'Asciutto 24°C – Hotlap',
   E'Setup da hotlap per il Mugello, una delle piste più tecniche d''Italia. La 911 RS si comporta molto bene grazie al motore posteriore che favorisce la trazione in uscita.\n\n'
   'Sospensioni: rigide davanti per limitare il rollio nei cambi di direzione rapidi (Arrabbiata 1-2).\n\n'
   'Assetto: altezza minima consentita, camber ant -3,2° / post -2,1°.\n\n'
   'Gomme:\n- Semislick / Traccia\n- Pressioni a freddo: Ant 28,0 PSI / Post 28,5 PSI\n\n'
   'Freni:\n- Bias: 56% (molta frenata posteriore per sfruttare il peso del motore)\n\n'
   'Note guida: alla San Donato tendi a staccare tardi; il sottosterzo si gestisce con la rotazione del volante prima della frenata.',
   62, 18, 22,
   now() - interval '3 days'),

  (uid, g_acevo,
   'Ferrari 499P – Laguna Seca Qualifica',
   'Ferrari 499P', 'Laguna Seca',
   'Asciutto 22°C – Qualifica',
   E'Assetto qualifica per la Ferrari 499P Hypercar a Laguna Seca. Il circuito californiano è corto ma tecnico, con il celebre "Cavatappi" (Corkscrew).\n\n'
   'Aerodinamica: carico alto (ant 7 / post 8) per gestire le curve cieche.\n\n'
   'Sospensioni: dumper morbidi per assorbire le variazioni di quota al Corkscrew e in fondo al rettilineo principale.\n\n'
   'MGU-K: recupero massimo in frenata al T2, deployment completo sul rettilineo principale.\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 25,5 PSI / Post 26,0 PSI\n\n'
   'Note guida: il Corkscrew si affronta alla cieca — impara il punto di staccata con i cartelli. Non aprire il gas prima di vedere l''uscita.',
   44, 15, 17,
   now() - interval '6 days'),

  (uid, g_acevo,
   'Audi R8 LMS GT3 – Imola Gara',
   'Audi R8 LMS GT3', 'Imola',
   'Asciutto 21°C – Gara 30 min',
   E'Setup gara per Imola. Bilanciamento tra durata gomme e passo sul giro, pensato per stint senza soste.\n\n'
   'Sospensioni: compromesso morbido-duro, ARB ant più morbido per evitare sottosterzo cronico alla Tamburello.\n\n'
   'Freni:\n- Pad più duri (tipo 3) per resistere al calore sulle frenate ripetute\n- Bias: 57,5%\n\n'
   'Nota: Imola è bumpy — non abbassare l''altezza oltre 55 mm post o carrai giri con il fondo.',
   28, 7, 9,
   now() - interval '11 days'),

  -- ── IRACING ─────────────────────────────────────────────────────

  (uid, g_iracing,
   'Dallara F3 – Silverstone GP Qualifica',
   'Dallara F3', 'Silverstone GP',
   'Dry 18°C – Qualifying',
   E'Setup da qualifica per Silverstone GP. Configurazione ad alto carico per massimizzare la velocità in uscita dal complesso Maggotts-Becketts-Chapel.\n\n'
   'Ali: Anteriore 15 / Posteriore 18\n\n'
   'Sospensioni:\n- Altezza ant: 30 mm | Post: 35 mm\n- Bump ant: 3 | Bump post: 4\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 23,5 PSI / Post 22,0 PSI\n\n'
   'Freni:\n- Bias: 55% | BBM: 42\n\n'
   'Note guida: Copse si percorre in pieno su gomme nuove in assetto qualifica. Trail brake verso Brooklands per far ruotare la macchina. A Luffield non esagerare con i cordoli o tocchi il fondo.',
   75, 24, 28,
   now() - interval '12 days'),

  (uid, g_iracing,
   'Porsche 911 GT3 Cup – Nürburgring GP Tire Management',
   'Porsche 911 GT3 Cup', 'Nürburgring GP',
   'Dry 17°C – Race',
   E'Setup da gara orientato alla gestione gomme per uno stint da 30 minuti. Il bilanciamento con motore posteriore della Cup richiede un approccio conservativo per evitare sovrasterzo in trazione.\n\n'
   'Punti chiave:\n- ARB anteriore morbido per ridurre l''usura delle gomme ant\n- Più carico posteriore rispetto alla qualifica per stabilizzare in accelerazione\n- Pressioni a freddo leggermente più basse della qualifica per lasciare margine di crescita\n\n'
   'Gomme: Ant 26,5 PSI a freddo / Post 26,8 PSI a freddo\n\n'
   'Elettronica: TC 5 per i primi 5 giri, poi scendi a TC 3 quando le gomme sono in temperatura.\n\n'
   'Note guida: la GT3 Cup sovrasterza su gomme fredde — apri il gas progressivamente nei primi 2 giri.',
   52, 16, 20,
   now() - interval '18 days'),

  -- ── LE MANS ULTIMATE ────────────────────────────────────────────

  (uid, g_lmu,
   'Ferrari 499P – Le Mans 24h Setup Endurance',
   'Ferrari 499P Hypercar', 'Circuit de la Sarthe',
   'Variabile – 24h Endurance',
   E'Setup endurance per le 24 Ore di Le Mans. Ottimizzato per stint da 40 minuti con pieno carico di carburante, bilanciando durata gomme e consumo.\n\n'
   'Filosofia: setup neutro, nessun compromesso estremo. La pista di Le Mans premia la guidabilità sulle Hunaudières più che il puro carico aerodinamico.\n\n'
   'Aerodinamica:\n- Ant: 3 (bassa drag sulle Hunaudières) | Post: 4\n\n'
   'Sospensioni: morbide per gestire i dossi nella notte (attenzione al tratto Porsche Curves al buio).\n\n'
   'Gestione carburante:\n- Stint a pieno carico: comportamento sottosterzante — aumenta il TC nei primi 5 giri\n- Con serbatoio scarico: ridurre ABS a 2 notch\n\n'
   'MGU: recupero massimo in frenata alle chicane della Ford; deployment aggressivo sul Rettilineo Mulsanne.\n\n'
   'Note strategia: se piove nella notte cambia immediatamente gomme — le Hunaudières sono pericolosissime sull''acqua.',
   91, 31, 36,
   now() - interval '9 days'),

  -- ── ASSETTO CORSA ───────────────────────────────────────────────

  (uid, g_ac,
   'Ferrari F2004 – Monza Time Attack',
   'Ferrari F2004', 'Monza',
   'Asciutto 23°C – Time Attack',
   E'Setup da time attack con la leggendaria Ferrari F2004. A Monza questa macchina è devastante: ala quasi piatta e motore 3.0 V10 al massimo.\n\n'
   'Aerodinamica:\n- Ala ant: 0 | Ala post: 1 (il minimo indispensabile per stabilità)\n\n'
   'Sospensioni: rigidissime, altezza al minimo (30 mm ant / 40 mm post).\n\n'
   'Gomme:\n- Pressioni a freddo: Ant 19,0 PSI / Post 21,0 PSI\n- Compound: Mescola Qualifica\n\n'
   'Freni:\n- Bias: 60% | Cooling: aperture quasi chiuse (poco raffreddamento serve con pochissimi giri)\n\n'
   'Note guida: la F2004 non perdona errori al freno. Stacca tardi alla Prima Variante, ma rispetta il punto di corda per non perdere velocità verso la Roggia. Parabolica in pieno il prima possibile.',
   68, 22, 26,
   now() - interval '22 days'),

  (uid, g_ac,
   'Mazda MX-5 Cup – Nordschleife Hotlap',
   'Mazda MX-5 Cup', 'Nürburgring Nordschleife',
   'Asciutto – Hotlap',
   E'Setup per la MX-5 Cup sul Nordschleife: la perfetta macchina per imparare la pista verde più lunga del mondo.\n\n'
   'La MX-5 non ha grandi possibilità di modifica, ma il giusto assetto di base fa la differenza nei 20+ km del Green Hell.\n\n'
   'Punti chiave:\n- Sospensioni morbide per assorbire i 300+ dossi e salti della pista\n- Pressioni gomme: Ant 29,0 PSI / Post 29,5 PSI (la pista si scalda lentamente)\n- Bias freni: 54% (bilancio neutro per non bloccare le posteriori in discesa)\n\n'
   'Note guida: Fuchsröhre, Pflanzgarten e Karussell si imparano a memoria — nessun setup compensa la conoscenza della pista. Goditi il viaggio.',
   39, 11, 13,
   now() - interval '30 days'),

  -- ── F1 25 ───────────────────────────────────────────────────────

  (uid, g_f1,
   'Mercedes W16 – Monaco Qualifica',
   'Mercedes-AMG W16', 'Monaco',
   'Asciutto 24°C – Qualifica',
   E'Setup qualifica per Monaco con la Mercedes W16. Il Principato richiede il massimo carico aerodinamico e una guidabilità impeccabile tra i guardrail.\n\n'
   'Aerodinamica: massimo carico (ant 11 / post 11). La velocità di punta non conta a Monaco.\n\n'
   'Sospensioni:\n- Rigide per limitare il rollio nelle curvas lente (Loews, Nouvelle, Rascasse)\n- Altezza minima: attento alle percussioni sul cordolo alla Piscine\n\n'
   'Setup differenziale:\n- On-throttle: 60% (trazione massima uscendo da Rascasse verso il rettilineo)\n- Off-throttle: 55%\n\n'
   'ERS: deployment massimo sul tratto Tunnel–Chicane, risparmia per il Rettilineo del Porto.\n\n'
   'Note guida: non cercare di superare a Monaco — gestisci le gomme, evita i muri. La qualifica è tutto: chi parte davanti, di solito vince.',
   56, 19, 23,
   now() - interval '4 days');

  RAISE NOTICE 'Seed completato: 13 assetti inseriti per utente %', uid;
END $$;
