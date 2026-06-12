'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Mail, MapPin, MessageCircle, Send, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import Footer from '@/components/layout/Footer'

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  subject: z.string().min(3, 'Objet requis'),
  message: z.string().min(20, 'Message trop court'),
})
type F = z.infer<typeof schema>

export default function ContactPage() {
  const locale = useLocale()
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '22890000000'
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: F) => {
    await fetch('/api/emails/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    })
    setSuccess(true)
    reset()
  }

  const contacts = [
    { icon: MessageCircle, label: 'WhatsApp', value: `+${wa}`, href: `https://wa.me/${wa}` },
    { icon: Mail, label: 'Email', value: 'contact@voyageelite.com', href: 'mailto:contact@voyageelite.com' },
    { icon: MapPin, label: 'Adresse', value: 'Lomé, Togo', href: null },
  ]

  return (
    <>
      <div className="min-h-screen bg-abyss pt-16">
        {/* Header */}
        <div className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(#C4A35A 1px,transparent 1px),linear-gradient(90deg,#C4A35A 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-copper/20 to-transparent" />
          <div className="container max-w-6xl px-6 mx-auto relative z-10">
            <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">Contact</p>
            <h1 className="font-display font-bold text-4xl sm:text-6xl text-ivory mb-5 leading-tight">
              Parlons de votre <span className="gradient-text">voyage</span>
            </h1>
            <p className="text-ivory-muted text-lg max-w-xl leading-relaxed">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
          </div>
        </div>

        <div className="container max-w-6xl px-6 mx-auto pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact info */}
            <div className="flex flex-col gap-4">
              <h2 className="font-display font-semibold text-xl text-ivory mb-2">Nous contacter</h2>
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4 bg-raised border border-subtle rounded-xl p-4 hover:border-copper/25 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-copper/10 border border-copper/15 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-copper" />
                  </div>
                  <div>
                    <div className="text-xs text-ivory-muted uppercase tracking-wider mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"
                        className="text-sm font-medium text-ivory hover:text-copper transition-colors">{value}</a>
                    ) : (
                      <span className="text-sm font-medium text-ivory">{value}</span>
                    )}
                  </div>
                </div>
              ))}

              <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 mt-2"
                style={{ background: '#25D366', boxShadow: '0 4px 20px rgba(37,211,102,0.2)' }}>
                <MessageCircle className="w-4 h-4" /> Discuter sur WhatsApp
              </a>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="bg-raised border-subtle">
                <CardContent className="pt-8 pb-8">
                  {success ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center gap-5 py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-copper" />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-xl text-ivory mb-2">Message envoyé !</h3>
                        <p className="text-ivory-muted text-sm">Notre équipe vous répondra sous 24h ouvrables.</p>
                      </div>
                      <Button variant="outline" onClick={() => setSuccess(false)}>Envoyer un autre message</Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nom complet</Label>
                          <Input {...register('name')} placeholder="Jean Dupont" />
                          {errors.name && <p className="text-red-400 text-xs">{errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input {...register('email')} type="email" placeholder="vous@exemple.com" />
                          {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Objet</Label>
                        <Input {...register('subject')} placeholder="Demande de visa Schengen" />
                        {errors.subject && <p className="text-red-400 text-xs">{errors.subject.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <Label>Message</Label>
                        <Textarea {...register('message')} rows={6} placeholder="Décrivez votre projet ou votre question en détail..." />
                        {errors.message && <p className="text-red-400 text-xs">{errors.message.message}</p>}
                      </div>
                      <Button type="submit" variant="copper" size="lg" disabled={isSubmitting} className="w-full gap-2">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Envoyer le message
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}
