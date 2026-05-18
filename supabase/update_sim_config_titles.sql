-- Aggiorna i titoli delle configurazioni simulatore al formato "Configurazione [Hardware]"
-- Esegui nell'SQL Editor di Supabase Dashboard

UPDATE setups SET title = 'Configurazione Thrustmaster T300 / T248'
  WHERE title = 'ACC – FFB Thrustmaster T300 / T248' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Fanatec CSL DD / DD Pro'
  WHERE title = 'ACC – FFB Fanatec CSL DD / DD Pro' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Grafica Stabile 1080p 60fps'
  WHERE title = 'ACC – Grafica 1080p 60fps Stabile (GPU mid-range)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Audio Ottimizzato per Cuffie'
  WHERE title = 'ACC – Audio Ottimizzato per Cuffie' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Direct Drive (Fanatec / Simucube / Moza)'
  WHERE title = 'iRacing – FFB Direct Drive (Fanatec / Simucube / Moza)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Logitech G29 / G923'
  WHERE title = 'iRacing – FFB Logitech G29 / G923' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Grafica Competitivo – Max FPS'
  WHERE title = 'iRacing – Grafica Competitivo (massimi FPS)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Thrustmaster & Fanatec'
  WHERE title = 'Le Mans Ultimate – FFB Thrustmaster & Fanatec' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Content Manager + LUT'
  WHERE title = 'Assetto Corsa – FFB con Content Manager' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Mapping Sterzo & Pedali'
  WHERE title = 'Assetto Corsa – Mapping Controlli & Sterzo Ottimale' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Volante F1 25'
  WHERE title = 'F1 25 – FFB Ottimizzato per Volante' AND setup_type = 'simulatore';
