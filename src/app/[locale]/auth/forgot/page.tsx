'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plane, CheckCircle2, AlertCircle, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({ email: z.string().email('Email invalide') })
type F = z.infer<typeof schema>

export default function ForgotPage() {
  const locale = useLocale()
  const supabase = createClient()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ email }: F) => {
    setError('')
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL}/${locale}/auth/reset-password`,
    })
    if (err) { setError(err.message); return }
    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(ellipse, rgba(196,163,90,0.15) 0%, transparent 70%)' }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-copper-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-abyss" />
            </div>
            <span className="font-display font-bold text-2xl text-ivory">Voyage<span className="gradient-text">Elite</span></span>
          </Link>
        </div>

        <div className="bg-raised border border-subtle rounded-2xl p-8 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center mb-5">
            <Mail className="w-6 h-6 text-copper" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ivory mb-2">Mot de passe oublié</h1>
          <p className="text-ivory-muted text-sm mb-8">Entrez votre email pour recevoir un lien de réinitialisation.</p>

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-copper" />
              </div>
              <div>
                <p className="font-semibold text-ivory mb-1">Email envoyé !</p>
                <p className="text-ivory-muted text-sm">Consultez votre boîte mail et cliquez sur le lien reçu.</p>
              </div>
              <Link href={`/${locale}/auth/login`}>
                <Button variant="outline" className="gap-2 mt-2"><ArrowLeft className="w-4 h-4" />Retour connexion</Button>
              </Link>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <Input id="email" {...register('email')} type="email" autoComplete="email" placeholder="vous@exemple.com" />
                  {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
                </div>
                <Button type="submit" variant="copper" size="lg" disabled={isSubmitting} className="w-full">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Envoyer le lien
                </Button>
              </form>
              <div className="mt-5 text-center">
                <Link href={`/${locale}/auth/login`}
                  className="inline-flex items-center gap-1.5 text-sm text-ivory-muted hover:text-copper transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
                </Link>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
