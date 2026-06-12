'use client'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CtaSection() {
  const t = useTranslations('cta')
  const locale = useLocale()
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '22890000000'

  return (
    <section className="py-32 bg-abyss relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse, rgba(196,163,90,0.1) 0%, transparent 70%)' }} />
      </div>

      {/* Top / bottom dividers */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/20 to-transparent" />

      <div className="relative z-10 container max-w-3xl px-6 mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}
        >
          <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-5">{t('label')}</p>
          <h2 className="font-display font-bold text-4xl sm:text-6xl text-ivory leading-tight mb-6">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-ivory-muted text-lg leading-relaxed mb-12 max-w-xl mx-auto">{t('subtitle')}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href={`/${locale}/auth/register`}>
              <Button variant="copper" size="xl" className="gap-2 w-full sm:w-auto group">
                {t('primary')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-14 px-10 w-full sm:w-auto rounded-xl text-white text-base font-medium transition-all hover:opacity-90 hover:-translate-y-px"
              style={{ background: '#25D366', boxShadow: '0 4px 24px rgba(37,211,102,0.25)' }}>
              <MessageCircle className="w-5 h-5" />
              {t('whatsapp')}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
