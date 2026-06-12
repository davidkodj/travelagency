import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();
    const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "VoyageElite <noreply@voyageelite.com>",
      to: process.env.FROM_EMAIL ?? "contact@voyageelite.com",
      replyTo: email,
      subject: `[Contact] ${subject} — ${name}`,
      html: `<div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:24px"><h2 style="color:#0f766e">Nouveau message</h2><p><b>De:</b> ${name} (${email})</p><p><b>Objet:</b> ${subject}</p><hr/><p style="white-space:pre-wrap">${message}</p></div>`,
    });

    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? "VoyageElite <noreply@voyageelite.com>",
      to: email,
      subject: "Votre message a bien été reçu — VoyageElite",
      html: `<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:32px 16px"><div style="background:#0f4c44;padding:28px;border-radius:12px 12px 0 0;text-align:center"><h1 style="color:white;margin:0;font-size:22px">Voyage<span style="color:#2dd4bf">Elite</span></h1></div><div style="background:white;padding:28px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb"><p style="color:#374151;line-height:1.7">Bonjour <b>${name}</b>,</p><p style="color:#374151;line-height:1.7">Merci pour votre message. Nous vous répondrons sous 24 heures ouvrables.</p>${wa ? `<p style="color:#374151">Urgence ? <a href="https://wa.me/${wa}" style="color:#0d9488;font-weight:600">WhatsApp</a></p>` : ""}<p style="color:#9ca3af;font-size:12px;margin-top:20px">© ${new Date().getFullYear()} VoyageElite</p></div></div>`,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
