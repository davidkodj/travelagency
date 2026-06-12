import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/layout/Footer'

interface Props { params: { locale: string } }

export default async function TermsPage({ params: { locale } }: Props) {
  const supabase = await createClient()
  const { data: page } = await supabase.from('pages_contenu').select('contenu,updated_at').eq('slug', 'cgu').single()
  const DEFAULT = 'CGU non encore configurées. Connectez-vous en tant qu\'admin pour les configurer.'

  return (
    <>
      <div className="min-h-screen bg-abyss pt-16">
        <div className="container max-w-3xl px-6 mx-auto py-14">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
          <p className="text-copper text-xs font-bold tracking-[0.2em] uppercase mb-4">Légal</p>
          <h1 className="font-display font-bold text-4xl text-ivory mb-3">Conditions Générales d'Utilisation</h1>
          {page?.updated_at && <p className="text-ivory-muted text-sm mb-10">Mise à jour : {new Date(page.updated_at).toLocaleDateString('fr-FR')}</p>}
          <div className="h-px bg-gradient-to-r from-copper/30 via-copper/10 to-transparent mb-10" />
          <div className="text-sm text-ivory-muted leading-[1.9] whitespace-pre-wrap">{page?.contenu ?? DEFAULT}</div>
        </div>
      </div>
      <Footer />
    </>
  )
}
