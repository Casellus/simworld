import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM ?? "noreply@simuniverse.it";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://simuniverse.vercel.app";

export async function sendApplicationAccepted({
  to,
  pilotName,
  teamName,
  teamSlug,
}: {
  to: string;
  pilotName: string;
  teamName: string;
  teamSlug: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Sei stato accettato nel team ${teamName}!`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0c;color:#f5f5f7;padding:32px;border-radius:8px">
        <div style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px">
          Sim<span style="color:#e10600">Universe</span>
        </div>
        <h1 style="font-size:20px;font-weight:800;text-transform:uppercase;margin-bottom:8px">
          Candidatura accettata! 🏁
        </h1>
        <p style="color:#8a8a92;margin-bottom:16px">
          Ciao <strong style="color:#f5f5f7">${pilotName}</strong>,
        </p>
        <p style="color:#8a8a92;margin-bottom:24px">
          La tua candidatura al team <strong style="color:#f5f5f7">${teamName}</strong> è stata <strong style="color:#00d26a">accettata</strong>!
          Sei ora ufficialmente parte del team.
        </p>
        <a href="${SITE}/team/${teamSlug}"
           style="display:inline-block;background:#e10600;color:white;padding:12px 24px;border-radius:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-decoration:none">
          Vai al team →
        </a>
        <p style="color:#8a8a92;margin-top:32px;font-size:12px">
          SimUniverse — Hub italiano del sim racing
        </p>
      </div>
    `,
  });
}

export async function sendApplicationRejected({
  to,
  pilotName,
  teamName,
}: {
  to: string;
  pilotName: string;
  teamName: string;
}) {
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Aggiornamento candidatura — team ${teamName}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0c;color:#f5f5f7;padding:32px;border-radius:8px">
        <div style="font-size:24px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px">
          Sim<span style="color:#e10600">Universe</span>
        </div>
        <h1 style="font-size:20px;font-weight:800;text-transform:uppercase;margin-bottom:8px">
          Candidatura non accettata
        </h1>
        <p style="color:#8a8a92;margin-bottom:16px">
          Ciao <strong style="color:#f5f5f7">${pilotName}</strong>,
        </p>
        <p style="color:#8a8a92;margin-bottom:24px">
          Purtroppo la tua candidatura al team <strong style="color:#f5f5f7">${teamName}</strong> non è andata a buon fine questa volta.
          Non arrenderti — ci sono altri team che cercano piloti!
        </p>
        <a href="${SITE}/cerca?tipo=cerca_pilota"
           style="display:inline-block;background:#e10600;color:white;padding:12px 24px;border-radius:6px;font-weight:700;text-transform:uppercase;letter-spacing:1px;text-decoration:none">
          Cerca altri team →
        </a>
        <p style="color:#8a8a92;margin-top:32px;font-size:12px">
          SimUniverse — Hub italiano del sim racing
        </p>
      </div>
    `,
  });
}
