'use client'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Upload, Loader2, CheckCircle2, ArrowLeft, X, FileText, Calendar, Compass } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const schema = z.object({
  type: z.enum(['voyage_organise', 'sur_mesure', 'visa']),
  message_client: z.string().min(20, 'Décrivez votre projet (min. 20 caractères)'),
})
type F = z.infer<typeof schema>

const TYPE_OPTIONS = [
  { value: 'voyage_organise', label: 'Voyage organisé', desc: 'Circuit clé en main', icon: Calendar },
  { value: 'sur_mesure',      label: 'Sur mesure',      desc: 'Entièrement personnalisé', icon: Compass },
  { value: 'visa',            label: 'Visa & démarches', desc: 'Accompagnement visa', icon: FileText },
] as const

export default function NouveauDossierPage() {
  const locale = useLocale()
  const router = useRouter()
  const supabase = createClient()
  const [files, setFiles] = useState<File[]>([])
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema), defaultValues: { type: 'voyage_organise' },
  })
  const selectedType = watch('type')

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const MAX = 10 * 1024 * 1024
    const ACCEPTED = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    const valid = Array.from(e.target.files ?? []).filter(f => ACCEPTED.includes(f.type) && f.size <= MAX)
    setFiles(prev => [...prev, ...valid])
    e.target.value = ''
  }

  const onSubmit = async (data: F) => {
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push(`/${locale}/auth/login`); return }

    const { data: dossier, error: dossierErr } = await supabase
      .from('dossiers').insert({ ...data, client_id: user.id, statut: 'en_attente' }).select().single()
    if (dossierErr || !dossier) { setError('Erreur lors de la soumission. Réessayez.'); return }

    for (const file of files) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${dossier.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('documents-clients').upload(path, file)
      if (!upErr) {
        await supabase.from('documents').insert({
          dossier_id: dossier.id, client_id: user.id,
          nom_fichier: file.name, storage_path: path,
          type_document: file.type.includes('pdf') ? 'pdf' : 'image',
        })
      }
    }

    await fetch('/api/emails/dossier-soumis', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dossier_id: dossier.id, user_id: user.id }),
    })
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-abyss pt-16 flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="bg-raised border border-subtle rounded-2xl p-12 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-copper/10 border border-copper/25 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-copper" />
            </div>
            <h2 className="font-display font-bold text-xl text-ivory mb-2">Dossier soumis !</h2>
            <p className="text-ivory-muted text-sm mb-8">Confirmation par email envoyée. Notre équipe vous recontacte sous 48h.</p>
            <Link href={`/${locale}/dashboard`}>
              <Button variant="copper" className="gap-2"><ArrowLeft className="w-4 h-4" />Tableau de bord</Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-2xl px-6 mx-auto py-12">
        <Link href={`/${locale}/dashboard`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-3">Nouveau dossier</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ivory mb-10">Votre demande</h1>

          {error && (
            <div className="bg-red-950/40 border border-red-800/40 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            {/* Type */}
            <Card className="bg-raised border-subtle">
              <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Type de demande</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {TYPE_OPTIONS.map(({ value, label, desc, icon: Icon }) => (
                  <button key={value} type="button" onClick={() => setValue('type', value)}
                    className={cn('flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-center transition-all',
                      selectedType === value
                        ? 'border-copper/50 bg-copper/8'
                        : 'border-subtle hover:border-copper/25 bg-surface/50')}>
                    <Icon className={cn('w-5 h-5', selectedType === value ? 'text-copper' : 'text-ivory-muted')} />
                    <span className={cn('text-xs font-semibold', selectedType === value ? 'text-copper' : 'text-ivory')}>{label}</span>
                    <span className="text-[10px] text-ivory-muted leading-tight">{desc}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Message */}
            <Card className="bg-raised border-subtle">
              <CardHeader className="pb-4"><CardTitle className="text-base font-semibold">Décrivez votre projet</CardTitle></CardHeader>
              <CardContent>
                <Textarea {...register('message_client')} rows={5}
                  placeholder="Destination souhaitée, dates, nombre de personnes, budget approximatif, besoins spécifiques..." />
                {errors.message_client && <p className="text-red-400 text-xs mt-2">{errors.message_client.message}</p>}
              </CardContent>
            </Card>

            {/* Documents */}
            <Card className="bg-raised border-subtle">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-semibold">Documents</CardTitle>
                <p className="text-xs text-ivory-muted mt-1">Passeport, pièce d'identité, etc. PDF, JPG, PNG — max 10 Mo</p>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <label className="flex flex-col items-center gap-2.5 border-2 border-dashed border-subtle rounded-xl py-8 cursor-pointer hover:border-copper/30 hover:bg-copper/3 transition-all">
                  <Upload className="w-6 h-6 text-ivory-muted" />
                  <span className="text-sm text-ivory-muted">Cliquez pour sélectionner des fichiers</span>
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFiles} className="sr-only" />
                </label>
                {files.length > 0 && (
                  <ul className="flex flex-col gap-2">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between bg-surface rounded-lg px-3 py-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-copper flex-shrink-0" />
                          <span className="text-sm text-ivory truncate">{f.name}</span>
                        </div>
                        <button type="button" onClick={() => setFiles(p => p.filter((_, j) => j !== i))}
                          className="text-ivory-muted hover:text-red-400 ml-2 flex-shrink-0 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Button type="submit" variant="copper" size="xl" disabled={isSubmitting} className="w-full gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Soumettre mon dossier
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
