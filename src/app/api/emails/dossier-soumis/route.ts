import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { dossier_id, user_id } = await req.json()
    const supabase = await createAdminClient()

    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user_id).single()

    const { data: user } = await supabase.auth.admin.getUserById(user_id)
    const email = user.user?.email
    if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

    const firstName = profile?.full_name?.split(' ')[0] ?? 'Client'
    const waNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''

    await resend.emails.send({
      from: process.env.FROM_EMAIL ?? 'VoyageElite <noreply@voyageelite.com>',
      to: email,
      subject: '✈️ Votre dossier a bien été reçu — VoyageElite',
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:system-ui,sans-serif;background:#f8f8f6;margin:0;padding:40px 16px;">
          <div style="max-width:520px;margin:0 auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(11,28,58,0.08)">
            <div style="background:#0B1C3A;padding:32px;text-align:center">
              <h1 style="color:white;font-size:26px;margin:0;font-weight:600">Voyage<span style="color:#C9A84C">Elite</span></h1>
            </div>
            <div style="padding:36px 32px">
              <h2 style="color:#0B1C3A;font-size:22px;margin-bottom:12px">Bonjour ${firstName} 👋</h2>
              <p style="color:#5A6070;line-height:1.7;margin-bottom:20px">
                Votre dossier a bien été reçu. Notre équipe va l'examiner et vous recontactera <strong>sous 48 heures ouvrables</strong>.
              </p>
              <p style="color:#5A6070;line-height:1.7;margin-bottom:28px">
                Vous pouvez suivre l'avancement de votre dossier en temps réel depuis votre espace client.
              </p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/fr/dashboard"
                style="display:inline-block;background:#C9A84C;color:#0B1C3A;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:600;font-size:15px">
                Voir mon dossier →
              </a>
              ${waNumber ? `
              <p style="margin-top:28px;color:#5A6070;font-size:14px">
                Pour toute question urgente, contactez-nous sur 
                <a href="https://wa.me/${waNumber}" style="color:#C9A84C;font-weight:600">WhatsApp</a>.
              </p>` : ''}
            </div>
            <div style="background:#f5f4f0;padding:20px 32px;text-align:center">
              <p style="color:#9A9690;font-size:12px;margin:0">
                © ${new Date().getFullYear()} VoyageElite — Lomé, Togo
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    // Also notify admins
    // (optional: send to your own email too)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Email error:', err)
    return NextResponse.json({ error: 'Email failed' }, { status: 500 })
  }
}
