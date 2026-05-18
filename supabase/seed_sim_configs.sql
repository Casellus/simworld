-- Seed configurazioni simulatore
-- Esegui nell'SQL Editor di Supabase Dashboard DOPO migration_setup_type.sql

DO $$
DECLARE
  uid  uuid := (SELECT id FROM auth.users WHERE email = 'samuelcasella06@gmail.com' LIMIT 1);
  acc  uuid := (SELECT id FROM games WHERE slug = 'acc'     LIMIT 1);
  ira  uuid := (SELECT id FROM games WHERE slug = 'iracing' LIMIT 1);
  lmu  uuid := (SELECT id FROM games WHERE slug = 'lmu'     LIMIT 1);
  ac   uuid := (SELECT id FROM games WHERE slug = 'ac'      LIMIT 1);
  f125 uuid := (SELECT id FROM games WHERE slug = 'f1-25'   LIMIT 1);
BEGIN

-- 1. ACC – FFB Thrustmaster T300 / T248
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, acc, 'simulatore', 'ffb', '', '',
  'Configurazione Thrustmaster T300 / T248',
  E'Settaggi force feedback ottimizzati per Assetto Corsa Competizione con volanti Thrustmaster T300 RS e T248.\n\nIn-game ACC (Impostazioni > Controlli > Force Feedback):\n• Gain: 75%\n• Min Force: 5%\n• Kerb Effect: 5%\n• Road Effect: 5%\n• Slip Effect: 10%\n• ABS Vibration: 0%\n• Enhance Under-steer: OFF\n\nThrustmaster Control Panel (Windows):\n• Overall Strength: 75%\n• Spring: 0%\n• Damper: 0%\n• Auto-Center: Game controllato\n\nNote: il Gain in-game va regolato in base alla propria sensibilità. Partire da 70% e aumentare finché si sente chiaramente il limite d''aderenza senza clip. Il Min Force aiuta a sentire le forze leggere nelle curve veloci.',
  '/setup-photos/sim-thrustmaster-wheel.jpg', 0, 0, 0);

-- 2. ACC – FFB Fanatec CSL DD / DD Pro
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, acc, 'simulatore', 'ffb', '', '',
  'Configurazione Fanatec CSL DD / DD Pro',
  E'Configurazione force feedback per Fanatec CSL DD e DD Pro su ACC. Valori testati in multiplayer competitivo.\n\nFanatec Wheel Base Settings (tuner on-wheel o Fanatec Control Panel):\n• SEN: 1080°\n• FF: 70\n• SHO: 100\n• ABS: Off\n• DRI: Off (o -3 per filtro leggero)\n• FOR: 100\n• SPR: 0\n• DPR: 0\n• BLI: Off\n• BRF: 30–50 (regola in base ai tuoi pedali)\n\nIn-game ACC:\n• Gain: 65%\n• Min Force: 3%\n• Kerb Effect: 8%\n• Road Effect: 3%\n• Slip Effect: 15%\n• Enhance Under-steer: ON\n\nNote: la potenza del direct drive richiede un Gain più basso rispetto ai belt-driven. Inizia da 60% e adatta in base alle tue preferenze.',
  '/setup-photos/sim-thrustmaster-rear.jpg', 0, 0, 0);

-- 3. ACC – Grafica 1080p 60fps stabile
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, acc, 'simulatore', 'grafica', '', '',
  'Grafica Stabile 1080p 60fps',
  E'Impostazioni grafiche ottimizzate per ottenere 60fps stabili in ACC con GPU di fascia media (RTX 3060 / RX 6600 o simili) a 1080p.\n\nImpostazioni ACC (Grafica):\n• Risoluzione: 1920×1080\n• V-Sync: OFF (usa il frame cap del driver)\n• Qualità Texture: Alta\n• Effetti: Medi\n• Dettaglio Vetture: Alta\n• Ombre: Medie (impatto enorme sulle performance)\n• Distanza Ombre: 50%\n• Ambient Occlusion: ON (HBAO)\n• Motion Blur: OFF (disturba in gara)\n• Lens Flare: OFF\n• TAA: ON – Qualità: Alta\n• Distanza LOD: 70%\n\nNote NVIDIA (Control Panel):\n• Power Management: Max Performance\n• Low Latency Mode: Ultra\n• Anisotropic Filtering: 16x (applica dal driver)\n\nAMD (Adrenalin):\n• Anti-Lag: ON\n• Radeon Chill: OFF\n• Image Sharpening: 80%',
  '/setup-photos/sim-screenshot-racing.jpg', 0, 0, 0);

-- 4. iRacing – FFB Direct Drive (Fanatec DD / Simucube / Moza)
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, ira, 'simulatore', 'ffb', '', '',
  'Configurazione Direct Drive (Fanatec / Simucube / Moza)',
  E'Configurazione FFB universale per volanti direct drive su iRacing. Funziona come base per Fanatec DD, Simucube 2, Moza R9/R12.\n\nIn-game iRacing (Options > Drives > Force Feedback):\n• Use Linear Mode: ON (consigliato per DD)\n• Reduce Force When Parked: ON\n• Wheel Force: 25–30 Nm (adatta al tuo volante)\n• Damping: 5–8%\n• Min Force: 0%\n• Max Force: varia per vettura (vedi nota)\n\nPer ogni vettura, usa il Max Force ottimale:\n• Open wheel (Dallara F3, IR-18): 30–40 Nm\n• GT3 (GTP, GT4): 20–25 Nm\n• Oval (Cup, SK): 20–30 Nm\n\nSimucube 2 (True Drive):\n• Damping: 5%\n• Friction: 2%\n• Inertia: 5%\n• Filter: 0\n• Reconstruction Filter: 5\n\nNote: in iRacing ogni vettura ha il suo Force Feedback. Usa la funzione Auto Calibrate (F9 > Auto) per ottimizzare il Max Force dopo ogni setup auto.',
  '/setup-photos/sim-logitech-g25-set.jpg', 0, 0, 0);

-- 5. iRacing – FFB Logitech G29 / G923
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, ira, 'simulatore', 'ffb', '', '',
  'Configurazione Logitech G29 / G923',
  E'Impostazioni force feedback ottimizzate per Logitech G29 e G923 su iRacing. Ideale per chi inizia il sim racing.\n\nLogitech G HUB:\n• Sensitivity: 900° (lascia gestire a iRacing)\n• Centering Spring: 0%\n• Damper Effect: 0%\n• Allow Game To Adjust Settings: ON\n\nIn-game iRacing:\n• Use Linear Mode: OFF\n• Wheel Force: 11 Nm (G29) / 11 Nm (G923)\n• Damping: 10–15%\n• Min Force: 2%\n• Max Force: auto o 20 Nm\n\nNote: il G29 ha limitata potenza FFB rispetto ai direct drive. Tieni il Damping attorno al 10% per smorzare le vibrazioni eccessive. Min Force a 2% aiuta a sentire meglio le forze leggere in curva.\n\nTip: scarica sempre il profilo specifico per vettura disponibile nel thread ufficiale iRacing del forum. I valori Max Force cambiano radicalmente tra formula e GT.',
  '/setup-photos/sim-logitech-g29.jpg', 0, 0, 0);

-- 6. iRacing – Grafica Competitivo (massimi FPS)
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, ira, 'simulatore', 'grafica', '', '',
  'Grafica Competitivo – Max FPS',
  E'Setup grafico per iRacing orientato alle massime performance. Ideale per chi usa VR o vuole frame rate altissimi in gara.\n\nIn-game iRacing (Options > Graphics):\n• Shadow Map Size: 2048 (bilanciamento qualità/performance)\n• Shadow Map Distance: 100m\n• Car Detail: Medium\n• Opponent Detail: Low\n• Crowd Detail: None\n• Environment Detail: Low\n• Texture Detail: High (poco impatto sulle FPS)\n• Enable Mirrors: ON (riduzione mirrors a Low)\n• Anti-Aliasing: 4x MSAA\n• Render Frames Ahead: 1\n• Frame Rate Limit: Monitor refresh + 10%\n\nPer VR (Meta Quest / Valve Index):\n• Render Resolution: 80–90%\n• Fixed Foveated Rendering: ON (se disponibile)\n• ASW / Reprojection: lascia su Auto\n\nNote: disabilitare il crowd e ridurre i dettagli avversari riduce drasticamente il carico CPU durante le gare affollate. Fondamentale per chi corre le endurance.',
  '/setup-photos/sim-playseat-cockpit.jpg', 0, 0, 0);

-- 7. LMU – FFB Thrustmaster + Fanatec
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, lmu, 'simulatore', 'ffb', '', '',
  'Configurazione Thrustmaster & Fanatec',
  E'Configurazione FFB per Le Mans Ultimate (basato su rFactor 2), compatibile con Thrustmaster e Fanatec.\n\nLMU usa il motore FFB di rFactor 2, molto dettagliato ma che richiede calibrazione.\n\nIn-game LMU (Settings > Controls > Force Feedback):\n• Steering Wheel Range: 1080° (o il range del tuo volante)\n• Overall FFB Strength: 100%\n• Per-Car Multiplier: varia (vedi sotto)\n• Stationary Friction: 0%\n• Damping: 0%\n\nThrustmaster T300 / TX:\n• Overall Strength (Control Panel): 75%\n• Constant: 100%, Periodic: 100%, Spring: 0%, Damper: 0%\n• In-game Per-Car: 1.0 per GT3, 0.8 per Hypercar\n\nFanatec:\n• FF: 80, SHO: 100, ABS: Off, DRI: Off, FOR: 100, SPR: 0, DPR: 0\n• In-game Per-Car: 0.9 per GT3, 0.7 per Hypercar\n\nNote: LMU aggiorna frequentemente il FFB. Verifica i valori nel forum ufficiale di Studio 397 dopo ogni major update. Il Hypercar ha FFB molto più violento del GT3 – abbassa sempre il Per-Car multiplier.',
  '/setup-photos/sim-thrustmaster-pedals.jpg', 0, 0, 0);

-- 8. Assetto Corsa – FFB Content Manager
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, ac, 'simulatore', 'ffb', '', '',
  'Configurazione Content Manager + LUT',
  E'Impostazioni force feedback per Assetto Corsa usando Content Manager (CM) e Custom Shaders Patch (CSP). Setup universale per Thrustmaster, Logitech e Fanatec.\n\nIn-game AC (Settings > Controls > Force Feedback):\n• Gain: 85%\n• Filter: 0.05\n• Min Force: 0%\n• Kerb Vibration: 0.5\n• Road Vibration: 0.5\n• Slip Vibration: 2.0\n• Enhanced Understeer: OFF\n\nContent Manager (Settings > Custom Shaders Patch > Controllers):\n• FFB Tweaks: ON\n• Gamma: 1.0\n• Max Force (by car): ON (permette di impostare il force per ogni vettura)\n• LUT: usa il LUT generator online (Gran Turismo LUT o Boosted Media LUT)\n\nLUT consigliata per Thrustmaster T300:\n1. Vai su alfa.org.il/LUT-generator\n2. Seleziona T300 RS GT\n3. Scarica il file .lut\n4. In CM: Settings > CSP > Controllers > FFB LUT > seleziona il file\n\nNote: con il LUT il Gain in-game può scendere a 50–60%. La LUT linearizza la risposta del volante, eliminando la zona morta centrale.',
  '/setup-photos/sim-playseat-cockpit2.jpg', 0, 0, 0);

-- 9. Assetto Corsa – Controlli con volante
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, ac, 'simulatore', 'controlli', '', '',
  'Mapping Sterzo & Pedali',
  E'Configurazione dei controlli e del mapping dello sterzo per Assetto Corsa. Ottimale per chi usa volante + pedali.\n\nSteering Settings (in-game):\n• Steering Speed: 0.25–0.40 (più basso = più morbido)\n• Steering Gamma: 1.0 (lineare)\n• Steering Filter: 0.02\n• Speed Sensitivity: 0.03\n• Brake Gamma: 1.0 (se usi pedali lineari) o 1.4 (pedali entry-level)\n• Clutch Gamma: 1.0\n\nDeadzone consigliato:\n• Sterzo: 0% (nessuna deadzone con volante)\n• Gas: 0%\n• Freno: 2–5% (se il pedale oscilla a riposo)\n• Frizione: 2%\n\nSaturation:\n• Sterzo: 100%\n• Gas: 100%\n• Freno: 100% (riduci se il pedale è troppo sensibile)\n\nNote importanti:\n- Calibra sempre i pedali in Windows prima di avviare AC\n- Con freni entry-level (G29, T300 pedali base) usa Brake Gamma 1.3–1.5 per simulare la progressività\n- Con freni a cella di carico usa sempre Gamma 1.0',
  '/setup-photos/sim-logitech-g25-set.jpg', 0, 0, 0);

-- 10. F1 25 – FFB e Controlli Volante
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, f125, 'simulatore', 'ffb', '', '',
  'Configurazione Volante F1 25',
  E'Configurazione force feedback per F1 25 ottimizzata per volanti Thrustmaster, Logitech e Fanatec. Basata sui settaggi della community competitiva.\n\nIn-game F1 25 (Settings > Controls > Calibration & FFB):\n• Vibration & FFB: ON\n• Telemetry Vibrations: ON\n• Wheel Damper: 0–5%\n• Maximum Wheel Rotation: 360° (F1 usa sterzo ridotto)\n• FFB Strength: 70% Thrustmaster / 60% Fanatec DD\n• Environmental Effects: 30%\n• Wheel Damper: 0%\n• Understeer Enhance: OFF\n\nThrustmaster (Control Panel):\n• Global Gain: 80%\n• Spring: 0%, Damper: 0%\n• Range: 360°\n\nFanatec:\n• SEN: 360, FF: 65, SHO: 100, DRI: Off\n\nLogitech G HUB:\n• Sensitivity: 360°\n• Centering Spring: 0%\n\nNote: F1 25 supporta il profilo specifico per volante. Vai su Settings > Controls > Preset e seleziona il tuo modello. Poi applica questi valori come punto di partenza. Il FFB è molto diverso dall''anno precedente – non usare profili di F1 24 su F1 25.',
  '/setup-photos/sim-thrustmaster-wheel.jpg', 0, 0, 0);

-- 11. ACC – Audio Ottimizzato Cuffie
INSERT INTO setups (user_id, game_id, setup_type, category, title, car, track, notes, photo_url, downloads, rating_sum, rating_count)
VALUES (uid, acc, 'simulatore', 'audio', '', '',
  'Audio Ottimizzato per Cuffie',
  E'Configurazione audio di Assetto Corsa Competizione ottimizzata per cuffie stereo e surround virtuale. Massimizza il feedback acustico in gara.\n\nIn-game ACC (Settings > Audio):\n• Master Volume: 80%\n• Engine: 75%\n• Opponent Engine: 35%\n• Tires: 70% (fondamentale – senti il grip)\n• Brakes: 60%\n• Wind: 20%\n• Crowd: 15%\n• UI: 50%\n\nWindows > Proprietà Dispositivo Audio:\n• Abilita surround virtuale (Dolby Atmos for Headphones o Windows Sonic)\n• Formato: 48.000 Hz, 24 bit\n• Miglioramenti audio: DISABILITATI (tranne surround virtuale)\n\nSteelSeries GG / Razer Synapse / ASUS Armoury:\n• EQ: ridurre le basse frequenze sotto i 100Hz di 3–4 dB\n• Aumentare la fascia 2–4 kHz di 2 dB (aiuta a sentire le sgommate)\n\nNote: il suono degli pneumatici in ACC è il feedback più importante. Tienilo almeno al 65% per sentire chiaramente quando stai perdendo aderenza. Il suono del motore degli avversari tienilo basso (30–40%) per non coprire il tuo.',
  '/setup-photos/sim-playseat-cockpit.jpg', 0, 0, 0);

END $$;
