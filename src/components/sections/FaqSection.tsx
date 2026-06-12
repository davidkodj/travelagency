'use client'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

export default function FaqSection() {
  const t = useTranslations('faq')
  const items = t.raw('items') as Array<{ q: string; a: string }>
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-28 bg-surface">
      <div className="container max-w-3xl px-6 mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">{t('label')}</p>
          <h2 className="font-display font-bold text-4xl sm:text-5xl text-ivory leading-tight">
            {t('title')} <span className="gradient-text">{t('titleAccent')}</span>
          </h2>
        </motion.div>

        <div className="flex flex-col divide-y divide-subtle">
          {items.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-6 text-left group"
              >
                <span className={`font-medium text-sm sm:text-base transition-colors ${open === i ? 'text-copper' : 'text-ivory group-hover:text-copper'}`}>
                  {item.q}
                </span>
                <motion.div
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                    open === i
                      ? 'border-copper/40 bg-copper/10 text-copper'
                      : 'border-subtle text-ivory-muted group-hover:border-copper/30 group-hover:text-copper'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-sm text-ivory-muted leading-[1.8]">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
