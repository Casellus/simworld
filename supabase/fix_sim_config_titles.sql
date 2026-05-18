-- Corregge i titoli delle configurazioni simulatore già inserite
-- Il titolo era finito per errore nella colonna 'track' invece di 'title'
-- Esegui nell'SQL Editor di Supabase Dashboard

UPDATE setups SET title = 'Configurazione Thrustmaster T300 / T248', track = ''
  WHERE track = 'ACC – FFB Thrustmaster T300 / T248' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Fanatec CSL DD / DD Pro', track = ''
  WHERE track = 'ACC – FFB Fanatec CSL DD / DD Pro' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Grafica Stabile 1080p 60fps', track = ''
  WHERE track = 'ACC – Grafica 1080p 60fps Stabile (GPU mid-range)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Audio Ottimizzato per Cuffie', track = ''
  WHERE track = 'ACC – Audio Ottimizzato per Cuffie' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Direct Drive (Fanatec / Simucube / Moza)', track = ''
  WHERE track = 'iRacing – FFB Direct Drive (Fanatec / Simucube / Moza)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Logitech G29 / G923', track = ''
  WHERE track = 'iRacing – FFB Logitech G29 / G923' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Grafica Competitivo – Max FPS', track = ''
  WHERE track = 'iRacing – Grafica Competitivo (massimi FPS)' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Thrustmaster & Fanatec', track = ''
  WHERE track = 'Le Mans Ultimate – FFB Thrustmaster & Fanatec' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Content Manager + LUT', track = ''
  WHERE track = 'Assetto Corsa – FFB con Content Manager' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Mapping Sterzo & Pedali', track = ''
  WHERE track = 'Assetto Corsa – Mapping Controlli & Sterzo Ottimale' AND setup_type = 'simulatore';

UPDATE setups SET title = 'Configurazione Volante F1 25', track = ''
  WHERE track = 'F1 25 – FFB Ottimizzato per Volante' AND setup_type = 'simulatore';
