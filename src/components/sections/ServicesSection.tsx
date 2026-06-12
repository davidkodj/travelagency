'use client'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Calendar, Compass, FileCheck } from 'lucide-react'

const icons = [Calendar, Compass, FileCheck]

export default function ServicesSection() {
  const t = useTranslations('services')
  const items = t.raw('items') as Array<{ title: string; desc: string; tag: string }>

  return (
    <section id="services" className="py-28 bg-surface relative">
      <div className="container max-w-6xl px-6 mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="mb-20">
          <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">{t('label')}</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ivory leading-tight">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((service, i) => {
            const Icon = icons[i]
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6 }}
                className="group relative bg-raised border border-subtle rounded-2xl p-8 overflow-hidden cursor-default hover:border-copper/30 transition-all duration-400">

                {/* Animated corner accent */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: 'radial-gradient(ellipse at top right, rgba(196,163,90,0.08), transparent)' }} />

                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-copper/10 border border-copper/20 flex items-center justify-center mb-7 group-hover:bg-copper/15 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-copper" />
                  </div>

                  <h3 className="font-display font-bold text-xl text-ivory mb-3">{service.title}</h3>
                  <p className="text-ivory-muted text-sm leading-[1.8] mb-6">{service.desc}</p>

                  <span className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase text-copper border border-copper/25 bg-copper/5 px-3 py-1.5 rounded-full">
                    {service.tag}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
