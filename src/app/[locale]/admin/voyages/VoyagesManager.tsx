'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Plus, Pencil, Trash2, Loader2, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import type { Voyage } from '@/types'

const schema = z.object({
  titre: z.string().min(2, 'Titre requis'),
  description: z.string().min(10, 'Description requise'),
  destination: z.string().min(2, 'Destination requise'),
  prix: z.coerce.number().min(0),
  duree_jours: z.coerce.number().min(1),
  places_disponibles: z.coerce.number().min(0),
  image_url: z.string().url('URL invalide').or(z.literal('')),
  actif: z.boolean(),
})
type F = z.infer<typeof schema>

interface Props { locale: string; initialVoyages: Voyage[] }

export default function VoyagesManager({ locale, initialVoyages }: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [voyages, setVoyages] = useState<Voyage[]>(initialVoyages)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Voyage | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { actif: true, prix: 0, duree_jours: 1, places_disponibles: 0, image_url: '' },
  })

  const openCreate = () => { setEditing(null); reset({ actif: true, prix: 0, duree_jours: 1, places_disponibles: 0, image_url: '' }); setOpen(true) }
  const openEdit = (v: Voyage) => {
    setEditing(v)
    reset({ titre: v.titre, description: v.description, destination: v.destination, prix: v.prix, duree_jours: v.duree_jours, places_disponibles: v.places_disponibles, image_url: v.image_url ?? '', actif: v.actif })
    setOpen(true)
  }

  const onSubmit = async (data: F) => {
    const payload = { ...data, image_url: data.image_url || null }
    if (editing) {
      const { data: updated, error } = await supabase.from('voyages').update(payload).eq('id', editing.id).select().single()
      if (!error && updated) { setVoyages(v => v.map(x => x.id === editing.id ? updated as Voyage : x)); setOpen(false) }
    } else {
      const { data: created, error } = await supabase.from('voyages').insert(payload).select().single()
      if (!error && created) { setVoyages(v => [created as Voyage, ...v]); setOpen(false) }
    }
  }

  const deleteVoyage = async (id: string) => {
    setDeleting(id)
    await supabase.from('voyages').delete().eq('id', id)
    setVoyages(v => v.filter(x => x.id !== id))
    setDeleting(null)
  }

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-5xl px-6 mx-auto py-12">
        <Link href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-2">Administration</p>
            <h1 className="font-display font-bold text-2xl text-ivory">Voyages ({voyages.length})</h1>
          </div>
          <Button variant="copper" onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Nouveau voyage</Button>
        </div>

        {voyages.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center bg-raised border border-subtle rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-copper/10 border border-copper/15 flex items-center justify-center mb-4">
              <Globe className="w-7 h-7 text-copper/50" />
            </div>
            <p className="text-ivory-muted mb-4">Aucun voyage pour l'instant.</p>
            <Button variant="copper" onClick={openCreate} className="gap-2"><Plus className="w-4 h-4" />Créer un voyage</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voyages.map(v => (
              <div key={v.id} className="group bg-raised border border-subtle rounded-2xl overflow-hidden hover:border-copper/25 transition-colors">
                <div className="h-32 bg-gradient-to-br from-surface to-raised flex items-center justify-center relative">
                  {v.image_url ? (
                    <img src={v.image_url} alt={v.titre} className="w-full h-full object-cover opacity-70" />
                  ) : (
                    <Globe className="w-10 h-10 text-copper/20" />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge variant={v.actif ? 'copper' : 'muted'} className="text-[10px]">
                      {v.actif ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2.5">
                  <h3 className="font-display font-semibold text-ivory leading-tight">{v.titre}</h3>
                  <p className="text-xs text-ivory-muted">{v.destination} — {v.duree_jours}j</p>
                  <p className="text-xs text-ivory-muted line-clamp-2 leading-relaxed">{v.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-subtle">
                    <span className="font-display font-bold gradient-text">{v.prix.toLocaleString()} <span className="text-xs text-ivory-muted font-normal">XOF</span></span>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(v)} className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory-muted hover:text-copper hover:bg-copper/10 transition-all">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteVoyage(v.id)} disabled={deleting === v.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-ivory-muted hover:text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-40">
                        {deleting === v.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? 'Modifier le voyage' : 'Nouveau voyage'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2"><Label>Titre</Label>
                  <Input {...register('titre')} placeholder="Circuit Europe Classique" />
                  {errors.titre && <p className="text-red-400 text-xs">{errors.titre.message}</p>}
                </div>
                <div className="space-y-2"><Label>Destination</Label>
                  <Input {...register('destination')} placeholder="Paris, France" />
                  {errors.destination && <p className="text-red-400 text-xs">{errors.destination.message}</p>}
                </div>
                <div className="space-y-2"><Label>Durée (jours)</Label>
                  <Input {...register('duree_jours')} type="number" min="1" />
                </div>
                <div className="space-y-2"><Label>Prix (XOF)</Label>
                  <Input {...register('prix')} type="number" min="0" />
                </div>
                <div className="space-y-2"><Label>Places disponibles</Label>
                  <Input {...register('places_disponibles')} type="number" min="0" />
                </div>
                <div className="col-span-2 space-y-2"><Label>URL image (optionnel)</Label>
                  <Input {...register('image_url')} placeholder="https://..." />
                  {errors.image_url && <p className="text-red-400 text-xs">{errors.image_url.message}</p>}
                </div>
                <div className="col-span-2 space-y-2"><Label>Description</Label>
                  <Textarea {...register('description')} rows={4} placeholder="Décrivez ce voyage..." />
                  {errors.description && <p className="text-red-400 text-xs">{errors.description.message}</p>}
                </div>
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="actif" {...register('actif')} className="w-4 h-4 accent-copper" />
                  <Label htmlFor="actif" className="cursor-pointer normal-case text-sm text-ivory-dim">Voyage actif (visible sur le site)</Label>
                </div>
              </div>
              <Separator className="bg-subtle" />
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" variant="copper" disabled={isSubmitting} className="gap-2">
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editing ? 'Enregistrer' : 'Créer le voyage'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
