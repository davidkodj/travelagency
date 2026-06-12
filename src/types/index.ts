export type Role = 'client' | 'admin' | 'super_admin'

export type DossierType = 'voyage_organise' | 'sur_mesure' | 'visa'

export type DossierStatut =
  | 'en_attente'
  | 'en_etude'
  | 'confirme'
  | 'paye'
  | 'termine'
  | 'annule'

export interface Profile {
  id: string
  full_name: string | null
  phone: string | null
  role: Role
  created_at: string
}

export interface Voyage {
  id: string
  titre: string
  description: string
  destination: string
  prix: number
  duree_jours: number
  places_disponibles: number
  image_url: string | null
  actif: boolean
  created_at: string
}

export interface Dossier {
  id: string
  client_id: string
  voyage_id: string | null
  type: DossierType
  statut: DossierStatut
  message_client: string | null
  notes_internes: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  voyages?: Voyage
}

export interface Document {
  id: string
  dossier_id: string
  client_id: string
  nom_fichier: string
  storage_path: string
  type_document: string
  uploaded_at: string
}

export interface StatutHistorique {
  id: string
  dossier_id: string
  ancien_statut: DossierStatut
  nouveau_statut: DossierStatut
  modifie_par: string
  commentaire: string | null
  created_at: string
}
