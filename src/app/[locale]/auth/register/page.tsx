'use client'
import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Plane, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  full_name: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(8, 'Numéro invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Mots de passe différents', path: ['confirm'] })
type F = z.infer<typeof schema>

export default function RegisterPage() {
  const t = useTranslations('auth.register')
  const locale = useLocale()
  const supabase = createClient()
  const [showPwd, setShowPwd] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: F) => {
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email: data.email, password: data.password,
      options: { data: { full_name: data.full_name, phone: data.phone } },
    })
    if (err) { setError(err.message || t('error')); return }
    setSuccess(true)
  }

  const bgLayout = (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(ellipse, rgba(196,163,90,0.15) 0%, transparent 70%)' }} />
      <div className="absolute inset-0 opacity-[0.02]"
        style={{ backgroundImage: 'linear-gradient(#C4A35A 1px,transparent 1px),linear-gradient(90deg,#C4A35A 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
    </div>
  )

  if (success) {
    return (
      <div className="min-h-screen bg-abyss flex items-center justify-center px-4 relative overflow-hidden">
        {bgLayout}
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 bg-raised border border-subtle rounded-2xl p-12 max-w-sm w-full text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-copper" />
          </div>
          <h2 className="font-display font-bold text-xl text-ivory mb-2">{t('success')}</h2>
          <p className="text-ivory-muted text-sm mb-8">Vérifiez votre boîte mail pour activer votre compte.</p>
          <Link href={`/${locale}/auth/login`}>
            <Button variant="copper" className="w-full">{t('login')}</Button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyss flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {bgLayout}
      <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-copper-gradient flex items-center justify-center">
              <Plane className="w-5 h-5 text-abyss" />
            </div>
            <span className="font-display font-bold text-2xl text-ivory">Voyage<span className="gradient-text">Elite</span></span>
          </Link>
        </div>

        <div className="bg-raised border border-subtle rounded-2xl p-8 shadow-2xl shadow-abyss/80">
          <h1 className="font-display font-bold text-2xl text-ivory mb-1">{t('title')}</h1>
          <p className="text-ivory-muted text-sm mb-8">{t('subtitle')}</p>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {[
              { name: 'full_name', label: t('fullName'), type: 'text', auto: 'name', ph: 'Jean Dupont' },
              { name: 'email', label: t('email'), type: 'email', auto: 'email', ph: 'vous@exemple.com' },
              { name: 'phone', label: t('phone'), type: 'tel', auto: 'tel', ph: '+228 90 00 00 00' },
            ].map(({ name, label, type, auto, ph }) => (
              <div key={name} className="space-y-2">
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} {...register(name as keyof F)} type={type} autoComplete={auto} placeholder={ph} />
                {errors[name as keyof F] && <p className="text-red-400 text-xs">{errors[name as keyof F]?.message}</p>}
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
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
              <Label htmlFor="confirm">{t('confirmPassword')}</Label>
              <Input id="confirm" {...register('confirm')} type="password" autoComplete="new-password" />
              {errors.confirm && <p className="text-red-400 text-xs">{errors.confirm.message}</p>}
            </div>

            <Button type="submit" variant="copper" size="lg" disabled={isSubmitting} className="w-full mt-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {t('submit')}
            </Button>
          </form>

          <p className="text-center text-sm text-ivory-muted mt-6">
            {t('hasAccount')}{' '}
            <Link href={`/${locale}/auth/login`} className="text-copper hover:text-copper-light transition-colors font-medium">{t('login')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
