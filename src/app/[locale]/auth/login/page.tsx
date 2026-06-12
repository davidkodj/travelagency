'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Plane, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type F = z.infer<typeof schema>

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: F) => {
    setError('')
    const { error: authErr } = await supabase.auth.signInWithPassword(data)
    if (authErr) { setError(t('error')); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError(t('error')); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    router.push(`/${locale}/${['admin','super_admin'].includes(profile?.role ?? '') ? 'admin' : 'dashboard'}`)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, rgba(196,163,90,0.15) 0%, transparent 70%)' }} />
      </div>
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#C4A35A 1px,transparent 1px),linear-gradient(90deg,#C4A35A 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

      <motion.div
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-copper-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-abyss" />
            </div>
            <span className="font-display font-bold text-2xl text-ivory">Voyage<span className="gradient-text">Elite</span></span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-raised border border-subtle rounded-2xl p-8 shadow-2xl shadow-abyss/80">
          <h1 className="font-display font-bold text-2xl text-ivory mb-1">{t('title')}</h1>
          <p className="text-ivory-muted text-sm mb-8">{t('subtitle')}</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input id="email" {...register('email')} type="email" autoComplete="email" placeholder="vous@exemple.com" />
              {errors.email && <p className="text-red-400 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t('password')}</Label>
                <Link href={`/${locale}/auth/forgot`} className="text-[11px] text-copper hover:text-copper-light transition-colors">{t('forgot')}</Link>
              </div>
              <div className="relative">
                <Input id="password" {...register('password')} type={showPwd ? 'text' : 'password'} autoComplete="current-password" className="pr-11" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-muted hover:text-ivory transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs">{errors.password.message}</p>}
            </div>

            <Button type="submit" variant="copper" size="lg" disabled={isSubmitting} className="w-full mt-1">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('submit')}
            </Button>
          </form>

          <p className="text-center text-sm text-ivory-muted mt-7">
            {t('noAccount')}{' '}
            <Link href={`/${locale}/auth/register`} className="text-copper hover:text-copper-light transition-colors font-medium">{t('register')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
