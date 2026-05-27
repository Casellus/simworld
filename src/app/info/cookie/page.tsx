import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — SimUniverse",
  description: "Informativa sull'utilizzo dei cookie su SimUniverse.",
};

export default function CookiePage() {
  return (
    <article className="prose-info">
      <h1>Cookie Policy</h1>
      <p className="meta">
        Versione 1.1 — Ultimo aggiornamento: 27 maggio 2025 &nbsp;·&nbsp;
        Ai sensi dell'art. 122 del D.Lgs. 196/2003 e delle Linee Guida del Garante
      </p>

      <div className="highlight-box">
        <p>
          <strong>In sintesi:</strong> utilizziamo solo cookie tecnici essenziali per l'autenticazione.
          Nessun cookie di profilazione, nessun tracker pubblicitario.
        </p>
      </div>

      <h2>Cosa sono i cookie</h2>
      <p>
        I cookie sono piccoli file di testo che i siti web salvano nel tuo browser durante la navigazione.
        Vengono usati per mantenere le preferenze, la sessione di accesso e altre informazioni funzionali.
      </p>

      <h2>Cookie utilizzati da SimUniverse</h2>
      <p>
        SimUniverse utilizza esclusivamente <strong>cookie tecnici</strong>, necessari al funzionamento
        della piattaforma. Non richiedono il consenso dell'utente ai sensi della normativa vigente.
      </p>

      <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Scopo</th>
            <th>Durata</th>
            <th>Fornitore</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sb-access-token</code></td>
            <td>Tecnico / sessione</td>
            <td>Mantiene la sessione di autenticazione dell'utente</td>
            <td>Sessione del browser</td>
            <td>Supabase</td>
          </tr>
          <tr>
            <td><code>sb-refresh-token</code></td>
            <td>Tecnico / persistente</td>
            <td>Rinnovo automatico della sessione senza re-login</td>
            <td>7 giorni</td>
            <td>Supabase</td>
          </tr>
        </tbody>
      </table>
      </div>

      <h2>Cookie di terze parti</h2>
      <p>
        SimUniverse <strong>non utilizza</strong> cookie di terze parti a fini analitici o pubblicitari.
        In particolare, la piattaforma non installa:
      </p>
      <ul>
        <li>Google Analytics o altri strumenti di analisi del traffico basati su cookie.</li>
        <li>Facebook Pixel o pixel pubblicitari di qualsiasi piattaforma social.</li>
        <li>Cookie di retargeting o profilazione comportamentale.</li>
      </ul>

      <h2>Come gestire i cookie</h2>
      <p>
        Puoi gestire, limitare o eliminare i cookie attraverso le impostazioni del tuo browser.
        Tieni presente che disabilitare i cookie tecnici potrebbe compromettere il funzionamento
        della piattaforma (es. impossibilità di effettuare il login).
      </p>
      <p>Istruzioni per i browser più diffusi:</p>
      <ul>
        <li>
          <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">
            Google Chrome
          </a>
        </li>
        <li>
          <a href="https://support.mozilla.org/it/kb/protezione-antitracciamento-avanzata-firefox" target="_blank" rel="noopener noreferrer">
            Mozilla Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">
            Apple Safari
          </a>
        </li>
        <li>
          <a href="https://support.microsoft.com/it-it/windows/eliminare-e-gestire-i-cookie-168dab11-0753-043d-7c16-ede5947fc64d" target="_blank" rel="noopener noreferrer">
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2>Modifiche alla Cookie Policy</h2>
      <p>
        In caso di modifiche sostanziali all'utilizzo dei cookie, aggiorneremo questa pagina e
        ti informeremo tramite avviso in piattaforma. La data di "Ultimo aggiornamento" in cima
        alla pagina sarà sempre aggiornata.
      </p>

      <h2>Contatti</h2>
      <p>
        Per qualsiasi domanda sui cookie e sulla privacy:<br />
        <a href="mailto:simuniverseit@gmail.com">simuniverseit@gmail.com</a>
      </p>
    </article>
  );
}
