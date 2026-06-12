'use client'
import { useState, useEffect } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plane, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Mots de passe différents', path: ['confirm'] })
type F = z.infer<typeof schema>

export default function ResetPasswordPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('Lien invalide ou expiré. Veuillez recommencer.')
    })
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async ({ password }: F) => {
    setError('')
    const { error: err } = await supabase.auth.updateUser({ password })
    if (err) { setError(err.message); return }
    setSuccess(true)
    setTimeout(() => router.push(`/${locale}/auth/login`), 2500)
  }

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] rounded-full opacity-15 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(196,163,90,0.15) 0%, transparent 70%)' }} />

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
            <KeyRound className="w-6 h-6 text-copper" />
          </div>
          <h1 className="font-display font-bold text-2xl text-ivory mb-2">Nouveau mot de passe</h1>
          <p className="text-ivory-muted text-sm mb-8">Choisissez un mot de passe sécurisé.</p>

          {success ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center py-4">
              <div className="w-14 h-14 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-copper" />
              </div>
              <div>
                <p className="font-semibold text-ivory mb-1">Mot de passe mis à jour !</p>
                <p className="text-ivory-muted text-sm">Redirection vers la connexion…</p>
              </div>
            </motion.div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-2 bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-5">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
                </div>
              )}
              {!ready && !error && (
                <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-copper animate-spin" /></div>
              )}
              {ready && (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="password" {...register('password')} type={showPwd ? 'text' : 'password'} autoComplete="new-password" className="pr-11" />
                      <button type="button" onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-muted hover:text-ivory transition-colors">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm">Confirmer</Label>
                    <Input id="confirm" {...register('confirm')} type="password" autoComplete="new-password" />
                    {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
                  </div>
                  <Button type="submit" variant="copper" size="lg" disabled={isSubmitting} className="w-full mt-1">
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Enregistrer
                  </Button>
                </form>
              )}
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
