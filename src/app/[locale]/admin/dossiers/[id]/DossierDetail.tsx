'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Download, Loader2, MessageCircle, Clock, CheckCircle2, FileText, CreditCard, Archive, XCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { DossierStatut } from '@/types'

const STATUTS: { value: DossierStatut; label: string; icon: any; cls: string }[] = [
  { value: 'en_attente', label: 'En attente',  icon: Clock,        cls: 'badge-en_attente' },
  { value: 'en_etude',   label: 'En étude',    icon: FileText,     cls: 'badge-en_etude' },
  { value: 'confirme',   label: 'Confirmé',    icon: CheckCircle2, cls: 'badge-confirme' },
  { value: 'paye',       label: 'Payé',        icon: CreditCard,   cls: 'badge-paye' },
  { value: 'termine',    label: 'Terminé',     icon: Archive,      cls: 'badge-termine' },
  { value: 'annule',     label: 'Annulé',      icon: XCircle,      cls: 'badge-annule' },
]

interface Props { dossier: any; documents: any[]; historique: any[]; locale: string; adminId: string }

export default function DossierDetail({ dossier, documents, historique, locale, adminId }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [statut, setStatut] = useState<DossierStatut>(dossier.statut)
  const [notes, setNotes] = useState(dossier.notes_internes ?? '')
  const [commentaire, setCommentaire] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const save = async () => {
    setSaving(true)
    const oldStatut = dossier.statut
    await supabase.from('dossiers').update({ statut, notes_internes: notes }).eq('id', dossier.id)
    if (statut !== oldStatut) {
      await supabase.from('statut_historique').insert({
        dossier_id: dossier.id, ancien_statut: oldStatut, nouveau_statut: statut,
        modifie_par: adminId, commentaire: commentaire || null,
      })
      await fetch('/api/emails/statut-change', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dossier_id: dossier.id, nouveau_statut: statut }),
      })
    }
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); router.refresh() }, 2000)
  }

  const downloadDoc = async (doc: any) => {
    const { data } = await supabase.storage.from('documents-clients').createSignedUrl(doc.storage_path, 60)
    if (data?.signedUrl) window.open(data.signedUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-6xl px-6 mx-auto py-12">
        <Link href={`/${locale}/admin/dossiers`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Retour aux dossiers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main col */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <Card className="bg-raised border-subtle">
              <CardHeader><CardTitle className="font-display">Informations client</CardTitle></CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-5 grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Nom complet', dossier.profiles?.full_name],
                  ['Téléphone', dossier.profiles?.phone],
                  ['Type de demande', dossier.type?.replace(/_/g, ' ')],
                  ['Soumis le', new Date(dossier.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-ivory-muted uppercase tracking-wider mb-1">{k}</div>
                    <div className="font-medium text-ivory capitalize">{v ?? '—'}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-raised border-subtle">
              <CardHeader><CardTitle className="font-display">Message du client</CardTitle></CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-5">
                <p className="text-sm text-ivory-muted leading-[1.8] whitespace-pre-wrap">{dossier.message_client || 'Aucun message.'}</p>
              </CardContent>
            </Card>

            <Card className="bg-raised border-subtle">
              <CardHeader><CardTitle className="font-display">Documents ({documents.length})</CardTitle></CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-5">
                {documents.length === 0 ? (
                  <p className="text-sm text-ivory-muted">Aucun document uploadé.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {documents.map(doc => (
                      <li key={doc.id} className="flex items-center justify-between bg-surface rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-copper flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ivory truncate">{doc.nom_fichier}</p>
                            <p className="text-xs text-ivory-muted">{new Date(doc.uploaded_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => downloadDoc(doc)}
                          className="gap-1.5 text-copper hover:text-copper-light flex-shrink-0 ml-2">
                          <Download className="w-3.5 h-3.5" /> Télécharger
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {historique.length > 0 && (
              <Card className="bg-raised border-subtle">
                <CardHeader><CardTitle className="font-display">Historique</CardTitle></CardHeader>
                <Separator className="bg-subtle" />
                <CardContent className="pt-5">
                  <div className="flex flex-col gap-4">
                    {historique.map((h) => {
                      const from = STATUTS.find(s => s.value === h.ancien_statut)
                      const to = STATUTS.find(s => s.value === h.nouveau_statut)
                      return (
                        <div key={h.id} className="flex gap-3 items-start">
                          <div className="w-2 h-2 bg-copper rounded-full mt-1.5 flex-shrink-0" />
                          <div className="text-sm">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${from?.cls ?? ''}`}>{from?.label}</span>
                              <ChevronRight className="w-3 h-3 text-ivory-muted" />
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${to?.cls ?? ''}`}>{to?.label}</span>
                            </div>
                            {h.commentaire && <p className="text-xs text-ivory-muted mt-1">{h.commentaire}</p>}
                            <p className="text-xs text-ivory-muted/50 mt-0.5">{new Date(h.created_at).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">
            <Card className="bg-raised border-subtle">
              <CardHeader><CardTitle className="font-display text-base">Changer le statut</CardTitle></CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-4 flex flex-col gap-2">
                {STATUTS.map(s => {
                  const Icon = s.icon
                  return (
                    <button key={s.value} onClick={() => setStatut(s.value)}
                      className={cn(
                        'flex items-center gap-2.5 w-full text-left px-3 py-2.5 rounded-xl border text-sm font-medium transition-all',
                        statut === s.value
                          ? 'border-copper/40 bg-copper/10 text-copper'
                          : 'border-subtle hover:border-copper/20 text-ivory-muted hover:text-ivory'
                      )}>
                      <Icon className="w-4 h-4 flex-shrink-0" /> {s.label}
                    </button>
                  )
                })}
                <div className="mt-2 space-y-2">
                  <Label className="text-ivory-muted">Commentaire (optionnel)</Label>
                  <Textarea value={commentaire} onChange={e => setCommentaire(e.target.value)}
                    placeholder="Raison du changement..." rows={2} className="text-sm" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-raised border-subtle">
              <CardHeader><CardTitle className="font-display text-base">Notes internes</CardTitle></CardHeader>
              <Separator className="bg-subtle" />
              <CardContent className="pt-4 flex flex-col gap-3">
                <Textarea value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="Notes visibles uniquement par les admins..." rows={4} className="text-sm" />
                <Button onClick={save} disabled={saving}
                  variant={saved ? 'secondary' : 'copper'} className="w-full gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {saved ? '✓ Enregistré' : 'Enregistrer'}
                </Button>
              </CardContent>
            </Card>

            {dossier.profiles?.phone && (
              <a href={`https://wa.me/${dossier.profiles.phone.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ background: '#25D366' }}>
                <MessageCircle className="w-4 h-4" /> WhatsApp client
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
