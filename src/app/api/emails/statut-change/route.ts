import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/server";
import type { DossierStatut } from "@/types";

const resend = new Resend(process.env.RESEND_API_KEY);

const STATUS_LABELS: Record<DossierStatut, string> = {
  en_attente: "En attente",
  en_etude: "🔍 En cours d'étude",
  confirme: "✅ Confirmé",
  paye: "💳 Payé — Tout est prêt !",
  termine: "🎉 Terminé",
  annule: "Annulé",
};

const STATUS_MESSAGES: Record<DossierStatut, string> = {
  en_attente: "Votre dossier est en attente de traitement.",
  en_etude:
    "Notre équipe examine actuellement votre dossier et prépare votre itinéraire ou votre étude visa. Vous recevrez notre réponse très prochainement.",
  confirme:
    "Excellent ! Votre voyage est confirmé. Notre équipe va vous contacter pour finaliser les détails et le paiement.",
  paye: "Votre dossier est complet et votre voyage est entièrement organisé. Bon voyage !",
  termine:
    "Nous espérons que votre voyage s'est parfaitement déroulé ! N'hésitez pas à nous laisser un avis.",
  annule:
    "Votre dossier a été annulé. Pour toute question, contactez-nous sur WhatsApp.",
};

export async function POST(req: NextRequest) {
  try {
    const { dossier_id, nouveau_statut } = (await req.json()) as {
      dossier_id: string;
      nouveau_statut: DossierStatut;
    };
    const supabase = await createAdminClient();

    const { data: dossier } = await supabase
      .from("dossiers")
      .select("client_id, type")
      .eq("id", dossier_id)
      .single();

    if (!dossier)
      return NextResponse.json({ error: "Dossier not found" }, { status: 404 });

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", dossier.client_id)
      .single();

    const { data: user } = await supabase.auth.admin.getUserById(
      dossier.client_id,
    );
    const email = user.user?.email;
    if (!email)
      return NextResponse.json({ error: "No email" }, { status: 400 });

    const firstName = profile?.full_name?.split(" ")[0] ?? "Client";
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
    const statusLabel = STATUS_LABELS[nouveau_statut];
    const statusMsg = STATUS_MESSAGES[nouveau_statut];

    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "VoyageElite <noreply@voyageelite.com>",
      to: email,
      subject: `Mise à jour de votre dossier : ${statusLabel} — VoyageElite`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:system-ui,sans-serif;background:#f8f8f6;margin:0;padding:40px 16px;">
          <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,28,58,0.08)">
            <div style="background:#0B1C3A;padding:32px;text-align:center">
              <h1 style="color:white;font-size:26px;margin:0;font-weight:600">Voyage<span style="color:#C9A84C">Elite</span></h1>
            </div>
            <div style="padding:36px 32px">
              <h2 style="color:#0B1C3A;font-size:22px;margin-bottom:12px">Bonjour ${firstName},</h2>
              <p style="color:#5A6070;line-height:1.7;margin-bottom:16px">
                Le statut de votre dossier a été mis à jour :
              </p>
              <div style="background:#F5EDD5;border:1px solid #C9A84C;border-radius:10px;padding:16px 20px;margin-bottom:24px">
                <p style="margin:0;color:#0B1C3A;font-weight:700;font-size:16px">${statusLabel}</p>
              </div>
              <p style="color:#5A6070;line-height:1.7;margin-bottom:28px">${statusMsg}</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/fr/dashboard"
                style="display:inline-block;background:#C9A84C;color:#0B1C3A;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
                Voir mon dossier →
              </a>
              ${
                waNumber
                  ? `
              <p style="margin-top:28px;color:#5A6070;font-size:14px">
                Des questions ? Contactez-nous sur 
                <a href="https://wa.me/${waNumber}" style="color:#C9A84C;font-weight:600">WhatsApp</a>.
              </p>`
                  : ""
              }
            </div>
            <div style="background:#f5f4f0;padding:20px 32px;text-align:center">
              <p style="color:#9A9690;font-size:12px;margin:0">
                © ${new Date().getFullYear()} VoyageElite — Bruxelles, Belgique
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Email error:", err);
    return NextResponse.json({ error: "Email failed" }, { status: 500 });
  }
}
