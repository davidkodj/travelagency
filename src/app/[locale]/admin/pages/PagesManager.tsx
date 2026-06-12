'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

interface Props { locale: string; initialCgu: string; initialPrivacy: string }

export default function PagesManager({ locale, initialCgu, initialPrivacy }: Props) {
  const supabase = createClient()
  const [cgu, setCgu] = useState(initialCgu || 'Rédigez ici vos Conditions Générales d\'Utilisation...')
  const [privacy, setPrivacy] = useState(initialPrivacy || 'Rédigez ici votre Politique de confidentialité...')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async (slug: string, contenu: string) => {
    setSaving(true)
    await supabase.from('pages_contenu').upsert({ slug, contenu, updated_at: new Date().toISOString() }, { onConflict: 'slug' })
    setSaving(false); setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-4xl px-6 mx-auto py-12">
        <Link href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-3">Administration</p>
        <h1 className="font-display font-bold text-2xl text-ivory mb-2">Gestion des pages légales</h1>
        <p className="text-ivory-muted text-sm mb-10">Modifiez le contenu des pages CGU et Politique de confidentialité.</p>

        <Tabs defaultValue="cgu">
          <TabsList className="mb-8">
            <TabsTrigger value="cgu">CGU</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          </TabsList>

          <TabsContent value="cgu">
            <Card className="bg-raised border-subtle">
              <CardHeader>
                <CardTitle className="font-display">Conditions Générales d'Utilisation</CardTitle>
                <CardDescription>
                  Affiché sur{' '}
                  <Link href={`/${locale}/terms`} target="_blank" className="text-copper hover:underline">/terms</Link>
                </CardDescription>
              </CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-5 flex flex-col gap-4">
                <Textarea value={cgu} onChange={e => setCgu(e.target.value)} rows={24} className="font-mono text-xs resize-y" />
                <div className="flex items-center gap-3">
                  <Button onClick={() => save('cgu', cgu)} disabled={saving} variant="copper" className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer les CGU
                  </Button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-copper">
                      <CheckCircle2 className="w-4 h-4" /> Sauvegardé
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card className="bg-raised border-subtle">
              <CardHeader>
                <CardTitle className="font-display">Politique de confidentialité</CardTitle>
                <CardDescription>
                  Affiché sur{' '}
                  <Link href={`/${locale}/privacy`} target="_blank" className="text-copper hover:underline">/privacy</Link>
                </CardDescription>
              </CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-5 flex flex-col gap-4">
                <Textarea value={privacy} onChange={e => setPrivacy(e.target.value)} rows={24} className="font-mono text-xs resize-y" />
                <div className="flex items-center gap-3">
                  <Button onClick={() => save('privacy', privacy)} disabled={saving} variant="copper" className="gap-2">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Enregistrer la politique
                  </Button>
                  {saved && (
                    <span className="flex items-center gap-1.5 text-sm text-copper">
                      <CheckCircle2 className="w-4 h-4" /> Sauvegardé
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
