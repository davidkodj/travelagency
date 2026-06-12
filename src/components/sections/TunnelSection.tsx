'use client'
import { useTranslations, useLocale } from 'next-intl'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { UserPlus, FileText, MapPin, Plane, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const icons = [UserPlus, FileText, MapPin, Plane]

export default function TunnelSection() {
  const t = useTranslations('tunnel')
  const locale = useLocale()
  const steps = t.raw('steps') as Array<{ num: string; title: string; desc: string }>

  return (
    <section id="tunnel" className="py-28 bg-abyss relative overflow-hidden">
      {/* Subtle grid */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#C4A35A 1px,transparent 1px),linear-gradient(90deg,#C4A35A 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <div className="container max-w-6xl px-6 mx-auto relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">{t('label')}</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ivory mb-5 leading-tight">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
          <p className="text-ivory-muted text-lg max-w-xl leading-relaxed">{t('subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((step, i) => {
            const Icon = icons[i]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                className="group relative bg-raised border border-subtle rounded-2xl p-6 cursor-default hover:border-copper/30 transition-all duration-300 overflow-hidden">
                {/* Glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(ellipse at top left, rgba(196,163,90,0.06), transparent 70%)' }} />

                {/* Number watermark */}
                <div className="absolute -top-2 -right-2 font-display font-black text-7xl text-copper/5 select-none">
                  {step.num}
                </div>

                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center mb-5 group-hover:bg-copper/15 transition-colors">
                    <Icon className="w-5 h-5 text-copper" />
                  </div>
                  <h3 className="font-display font-semibold text-ivory text-base mb-2">{step.title}</h3>
                  <p className="text-ivory-muted text-sm leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} className="text-center">
          <Link href={`/${locale}/auth/register`}>
            <Button variant="copper" size="lg" className="gap-2 group">
              {t('cta')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
