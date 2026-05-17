import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chi siamo — SimUniverse",
  description: "SimUniverse è l'hub italiano del sim racing: tornei, team, assetti e guide in un'unica community.",
};

export default function ChiSiamoPage() {
  return (
    <article className="prose-info">
      <h1>Chi siamo</h1>
      <p className="meta">La community italiana del sim racing</p>

      <h2>Il progetto</h2>
      <p>
        <strong>SimUniverse</strong> nasce dalla passione per il sim racing e dalla consapevolezza
        che la community italiana fosse frammentata tra decine di Discord, gruppi Facebook e forum
        separati — senza un punto di riferimento unico.
      </p>
      <p>
        La nostra missione è semplice: <strong>riunire piloti, team, organizzatori di tornei e appassionati
        in un'unica piattaforma pensata per il sim racing italiano</strong>. Un luogo dove trovare
        compagni con cui correre, organizzare campionati, condividere assetti e imparare dagli altri.
      </p>

      <h2>Cosa offriamo</h2>
      <ul>
        <li>
          <strong>Eventi e tornei</strong> — organizza o partecipa a gare su ACC, iRacing, LMU,
          Assetto Corsa EVO, F1 25 e altri titoli. Sistema di iscrizione integrato e gestione partecipanti.
        </li>
        <li>
          <strong>Team</strong> — crea o entra in un team sim racing. Gestisci il roster,
          ricevi candidature e costruisci la tua storia insieme.
        </li>
        <li>
          <strong>Assetti</strong> — condividi e scarica setup per ogni tracciato e condizione.
          Trova il bilanciamento perfetto grazie all'esperienza della community.
        </li>
        <li>
          <strong>Guide</strong> — tutoriali, analisi di traiettorie, consigli tecnici.
          Dal principiante all'utente avanzato.
        </li>
        <li>
          <strong>Cerca pilota / team</strong> — pubblica il tuo profilo o cerca il compagno ideale
          con il sistema di recruiting integrato.
        </li>
      </ul>

      <h2>I valori della community</h2>
      <ul>
        <li><strong>Rispetto</strong> — all'interno della piattaforma vige una politica di tolleranza zero per comportamenti tossici, insulti e discriminazioni.</li>
        <li><strong>Fair play</strong> — siamo appassionati di motorsport virtuale: la sportività è nel DNA di questa community.</li>
        <li><strong>Condivisione</strong> — la conoscenza cresce quando si condivide. Assetti, guide e consigli sono il cuore di SimUniverse.</li>
        <li><strong>Inclusività</strong> — benvenuti principianti e veterani, da ogni angolo d'Italia e non solo.</li>
      </ul>

      <h2>Giochi supportati</h2>
      <p>SimUniverse supporta i principali titoli di sim racing:</p>
      <ul>
        <li>Assetto Corsa Competizione (ACC)</li>
        <li>iRacing</li>
        <li>Le Mans Ultimate (LMU)</li>
        <li>Assetto Corsa EVO</li>
        <li>F1 25</li>
        <li>Automobilista 2 (AMS2)</li>
        <li>rFactor 2</li>
      </ul>
      <p>La lista si espanderà in base alle esigenze della community.</p>

      <h2>Contatti</h2>
      <p>
        Hai domande, suggerimenti o vuoi collaborare con noi?<br />
        Scrivici a <a href="mailto:ciao@simuniverse.it">ciao@simuniverse.it</a> —
        leggiamo tutto e rispondiamo a tutti.
      </p>

      <div className="highlight-box" style={{ marginTop: "2.5rem" }}>
        <p>
          Pronto a scendere in pista?{" "}
          <Link href="/auth/register"><strong>Crea il tuo account gratuitamente</strong></Link> e
          unisciti alla community.
        </p>
      </div>
    </article>
  );
}
