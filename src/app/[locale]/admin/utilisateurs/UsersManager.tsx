'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Shield, User, Crown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { Profile, Role } from '@/types'

const ROLE_CONFIG: Record<Role, { label: string; icon: any; cls: string }> = {
  client:      { label: 'Client',      icon: User,   cls: 'badge-termine' },
  admin:       { label: 'Admin',       icon: Shield, cls: 'badge-en_etude' },
  super_admin: { label: 'Super Admin', icon: Crown,  cls: 'badge-confirme' },
}

interface Props { locale: string; initialUsers: Profile[]; currentUserId: string; currentRole: string }

export default function UsersManager({ locale, initialUsers, currentUserId, currentRole }: Props) {
  const supabase = createClient()
  const [users, setUsers] = useState<Profile[]>(initialUsers)
  const [updating, setUpdating] = useState<string | null>(null)

  const updateRole = async (userId: string, role: Role) => {
    setUpdating(userId)
    const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)
    if (!error) setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x))
    setUpdating(null)
  }

  const stats = [
    ['Total', users.length],
    ['Clients', users.filter(u => u.role === 'client').length],
    ['Admins', users.filter(u => u.role !== 'client').length],
  ]

  return (
    <div className="min-h-screen bg-abyss pt-16">
      <div className="container max-w-5xl px-6 mx-auto py-12">
        <Link href={`/${locale}/admin`}
          className="inline-flex items-center gap-2 text-sm text-ivory-muted hover:text-copper transition-colors mb-10">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
        <p className="text-copper text-xs font-bold tracking-[0.15em] uppercase mb-3">Administration</p>
        <h1 className="font-display font-bold text-2xl text-ivory mb-2">Utilisateurs ({users.length})</h1>
        <p className="text-ivory-muted text-sm mb-10">Gérez les rôles. Ne retirez pas vos propres droits admin.</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {stats.map(([l, v]) => (
            <div key={l} className="bg-raised border border-subtle rounded-xl text-center py-4">
              <div className="font-display font-bold text-2xl gradient-text mb-0.5">{v}</div>
              <div className="text-xs text-ivory-muted">{l}</div>
            </div>
          ))}
        </div>

        <div className="bg-raised border border-subtle rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-subtle">
                  {['Utilisateur', 'Date', 'Téléphone', 'Rôle', 'Modifier'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-ivory-muted uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const roleConf = ROLE_CONFIG[u.role as Role] ?? ROLE_CONFIG.client
                  const Icon = roleConf.icon
                  const isSelf = u.id === currentUserId
                  return (
                    <tr key={u.id} className={cn('border-b border-subtle/50 hover:bg-surface/40 transition-colors', isSelf && 'bg-copper/3')}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-ivory">{u.full_name ?? '—'}</div>
                        {isSelf && <div className="text-[10px] text-copper font-semibold mt-0.5">Vous</div>}
                      </td>
                      <td className="px-5 py-4 text-ivory-muted text-xs whitespace-nowrap">
                        {new Date(u.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-5 py-4 text-ivory-muted text-xs">{u.phone ?? '—'}</td>
                      <td className="px-5 py-4">
                        <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border', roleConf.cls)}>
                          <Icon className="w-3 h-3" />{roleConf.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {isSelf ? (
                          <span className="text-xs text-ivory-muted/50 italic">Non modifiable</span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Select defaultValue={u.role}
                              onValueChange={(v) => updateRole(u.id, v as Role)}
                              disabled={updating === u.id || (currentRole !== 'super_admin' && u.role === 'super_admin')}>
                              <SelectTrigger className="w-36 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client">Client</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                {currentRole === 'super_admin' && <SelectItem value="super_admin">Super Admin</SelectItem>}
                              </SelectContent>
                            </Select>
                            {updating === u.id && <Loader2 className="w-3.5 h-3.5 animate-spin text-copper" />}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
