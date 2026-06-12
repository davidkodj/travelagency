import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Plane, Mail, MapPin, MessageCircle } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '22890000000'

  return (
    <footer className="bg-abyss border-t border-subtle">
      <div className="container max-w-6xl px-6 mx-auto pt-16 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-14">
          <div className="lg:col-span-1">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-lg bg-copper-gradient flex items-center justify-center">
                <Plane className="w-4 h-4 text-abyss" />
              </div>
              <span className="font-display font-bold text-lg text-ivory">Voyage<span className="gradient-text">Elite</span></span>
            </Link>
            <p className="text-sm text-ivory-muted leading-relaxed">{t('tagline')}</p>
          </div>

          <div>
            <h5 className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-5">{t('services')}</h5>
            <ul className="flex flex-col gap-3 text-sm text-ivory-muted">
              {['Voyages organisés', 'Sur mesure', 'Visa & démarches'].map(s => (
                <li key={s}>
                  <Link href={`/${locale}/voyages`} className="hover:text-copper transition-colors">{s}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-5">{t('quickLinks')}</h5>
            <ul className="flex flex-col gap-3 text-sm text-ivory-muted">
              <li><Link href={`/${locale}/dashboard`} className="hover:text-copper transition-colors">{t('myAccount')}</Link></li>
              <li><Link href={`/${locale}/auth/register`} className="hover:text-copper transition-colors">{t('createAccount')}</Link></li>
              <li><Link href={`/${locale}/contact`} className="hover:text-copper transition-colors">{t('contactUs')}</Link></li>
            </ul>
          </div>

          <div>
            <h5 className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-5">{t('contact')}</h5>
            <ul className="flex flex-col gap-3 text-sm text-ivory-muted">
              <li>
                <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-copper transition-colors">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:contact@voyageelite.com"
                  className="flex items-center gap-2 hover:text-copper transition-colors">
                  <Mail className="w-4 h-4" /> contact@voyageelite.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Lomé, Togo
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="border-t border-subtle pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-ivory-muted/50">
            © {new Date().getFullYear()} VoyageElite. {t('rights')}
          </span>
          <div className="flex items-center gap-1">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-copper/40" />
            <div className="flex gap-4 text-xs text-ivory-muted/50">
              <Link href={`/${locale}/privacy`} className="hover:text-copper transition-colors">{t('privacy')}</Link>
              <Link href={`/${locale}/terms`} className="hover:text-copper transition-colors">{t('terms')}</Link>
            </div>
            <div className="h-px w-8 bg-gradient-to-l from-transparent to-copper/40" />
          </div>
        </div>
      </div>
    </footer>
  )
}
