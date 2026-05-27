import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — SimUniverse",
  description: "Informativa sul trattamento dei dati personali di SimUniverse ai sensi del GDPR (Regolamento UE 2016/679).",
};

export default function PrivacyPage() {
  return (
    <article className="prose-info">
      <h1>Privacy Policy</h1>
      <p className="meta">
        Versione 1.1 — Ultimo aggiornamento: 27 maggio 2025 &nbsp;·&nbsp;
        Ai sensi del Regolamento UE 2016/679 (GDPR)
      </p>

      <div className="highlight-box">
        <p>
          <strong>In sintesi:</strong> raccogliamo solo i dati strettamente necessari per far funzionare la piattaforma.
          Non vendiamo i tuoi dati. Puoi richiederne la cancellazione in qualsiasi momento scrivendo a{" "}
          <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a>.
        </p>
      </div>

      {/* 1 */}
      <h2>1. Titolare del trattamento</h2>
      <p>
        Il Titolare del trattamento dei dati personali è <strong>SimUniverse</strong> (di seguito "Piattaforma"),
        contattabile all'indirizzo e-mail <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a>.
      </p>

      {/* 2 */}
      <h2>2. Tipologie di dati raccolti</h2>
      <p>Durante l'utilizzo della Piattaforma possono essere trattati i seguenti dati personali:</p>
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>Dati</th>
            <th>Modalità di raccolta</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dati di account</strong></td>
            <td>Indirizzo e-mail, nome utente, password (crittografata), foto profilo opzionale</td>
            <td>Registrazione diretta o OAuth (Discord)</td>
          </tr>
          <tr>
            <td><strong>Dati di profilo</strong></td>
            <td>Nickname, bio, giochi preferiti, immagine team</td>
            <td>Inserimento volontario dell'utente</td>
          </tr>
          <tr>
            <td><strong>Contenuti generati</strong></td>
            <td>Annunci, assetti, guide, commenti, iscrizioni a eventi</td>
            <td>Azioni dell'utente sulla piattaforma</td>
          </tr>
          <tr>
            <td><strong>Dati tecnici</strong></td>
            <td>Indirizzo IP, tipo di browser, sistema operativo, pagine visitate</td>
            <td>Log automatici del server</td>
          </tr>
          <tr>
            <td><strong>Cookie</strong></td>
            <td>Cookie di sessione (autenticazione), cookie tecnici</td>
            <td>Automatico — vedi sezione 7</td>
          </tr>
        </tbody>
      </table>

      {/* 3 */}
      <h2>3. Finalità e basi giuridiche del trattamento</h2>
      <ul>
        <li>
          <strong>Erogazione del servizio</strong> — esecuzione del contratto (art. 6 par. 1 lett. b GDPR):
          gestione dell'account, autenticazione, partecipazione a eventi, pubblicazione contenuti.
        </li>
        <li>
          <strong>Sicurezza e prevenzione delle frodi</strong> — legittimo interesse (art. 6 par. 1 lett. f GDPR):
          monitoraggio accessi anomali, protezione degli account.
        </li>
        <li>
          <strong>Comunicazioni di servizio</strong> — esecuzione del contratto: notifiche relative
          all'account, aggiornamenti sugli eventi a cui sei iscritto.
        </li>
        <li>
          <strong>Obblighi di legge</strong> — obbligo legale (art. 6 par. 1 lett. c GDPR):
          conservazione dei log ai sensi delle normative vigenti.
        </li>
      </ul>

      {/* 4 */}
      <h2>4. Condivisione dei dati con terze parti</h2>
      <p>I dati personali non vengono venduti né ceduti a terzi a fini commerciali. Possono essere comunicati a:</p>
      <ul>
        <li>
          <strong>Supabase Inc.</strong> (USA, con adeguate garanzie — Clausole Contrattuali Standard):
          servizi di database, autenticazione e storage dei file caricati.
        </li>
        <li>
          <strong>Vercel Inc.</strong> (USA, con adeguate garanzie — DPA disponibile):
          hosting e CDN della piattaforma web.
        </li>
        <li>
          <strong>Autorità pubbliche</strong>: solo se richiesto da specifico obbligo di legge.
        </li>
      </ul>

      {/* 5 */}
      <h2>5. Trasferimento dei dati fuori dall'UE</h2>
      <p>
        Alcuni fornitori tecnici (Supabase, Vercel) elaborano dati negli Stati Uniti.
        Il trasferimento avviene nel rispetto delle Clausole Contrattuali Standard approvate dalla Commissione Europea
        (decisione 2021/914/UE), che garantiscono un livello di protezione adeguato.
      </p>

      {/* 6 */}
      <h2>6. Conservazione dei dati</h2>
      <ul>
        <li><strong>Dati di account:</strong> per tutta la durata dell'iscrizione, poi cancellati entro 30 giorni dalla richiesta.</li>
        <li><strong>Contenuti pubblicati:</strong> visibili fino alla cancellazione dell'account o del singolo contenuto.</li>
        <li><strong>Log di accesso:</strong> massimo 12 mesi, salvo obblighi di legge diversi.</li>
        <li><strong>Dati di fatturazione:</strong> non applicabile — il servizio è attualmente gratuito e non vengono raccolti dati di pagamento.</li>
      </ul>

      {/* 7 */}
      <h2>7. Cookie e tecnologie di tracciamento</h2>
      <p>Utilizziamo esclusivamente <strong>cookie tecnici e di sessione</strong> necessari al funzionamento della piattaforma:</p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Scopo</th><th>Durata</th></tr>
        </thead>
        <tbody>
          <tr><td><code>sb-access-token</code></td><td>Token di autenticazione Supabase</td><td>Sessione</td></tr>
          <tr><td><code>sb-refresh-token</code></td><td>Rinnovo automatico sessione</td><td>7 giorni</td></tr>
        </tbody>
      </table>
      <p>
        Non utilizziamo cookie di profilazione, cookie pubblicitari né tracker di terze parti
        (Google Analytics, Facebook Pixel, ecc.).
      </p>

      {/* 8 */}
      <h2>8. Diritti dell'interessato</h2>
      <p>Ai sensi degli artt. 15-22 del GDPR hai il diritto di:</p>
      <ul>
        <li><strong>Accesso</strong> — ottenere copia dei tuoi dati personali trattati.</li>
        <li><strong>Rettifica</strong> — correggere dati inesatti o incompleti.</li>
        <li><strong>Cancellazione</strong> ("diritto all'oblio") — chiedere l'eliminazione del tuo account e dei tuoi dati.</li>
        <li><strong>Limitazione</strong> — richiedere la sospensione del trattamento in determinati casi.</li>
        <li><strong>Portabilità</strong> — ricevere i tuoi dati in formato strutturato e leggibile da macchina.</li>
        <li><strong>Opposizione</strong> — opporti al trattamento basato su legittimo interesse.</li>
        <li><strong>Revoca del consenso</strong> — ove il trattamento sia basato sul consenso, revocarlo in qualsiasi momento.</li>
      </ul>
      <p>
        Per esercitare questi diritti scrivi a <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a>.
        Risponderemo entro 30 giorni. Hai inoltre il diritto di proporre reclamo al{" "}
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
          Garante per la protezione dei dati personali
        </a>.
      </p>

      {/* 9 */}
      <h2>9. Sicurezza dei dati</h2>
      <p>
        Adottiamo misure tecniche e organizzative adeguate per proteggere i dati: cifratura TLS in transito,
        hashing bcrypt delle password, accessi al database con Row Level Security (RLS), backup cifrati.
        In caso di violazione dei dati notificheremo le autorità competenti entro 72 ore e gli utenti interessati
        senza ingiustificato ritardo.
      </p>

      {/* 10 */}
      <h2>10. Minori</h2>
      <p>
        La piattaforma non è rivolta a minori di 16 anni. Se ritieni che un minore abbia creato un account,
        contattaci a <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a> per la cancellazione immediata.
      </p>

      {/* 11 */}
      <h2>11. Modifiche alla presente informativa</h2>
      <p>
        Eventuali modifiche sostanziali saranno comunicate tramite avviso sulla piattaforma e/o via e-mail
        con almeno 15 giorni di preavviso. La data di "Ultimo aggiornamento" in cima alla pagina sarà sempre aggiornata.
        L'uso continuato della piattaforma dopo le modifiche costituisce accettazione della nuova informativa.
      </p>

      {/* 12 */}
      <h2>12. Contatti</h2>
      <p>
        Per qualsiasi domanda relativa alla privacy:<br />
        <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a>
      </p>
    </article>
  );
}
