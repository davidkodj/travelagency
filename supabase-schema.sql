-- ============================================================
-- VOYAGEELITE — Schéma complet Supabase
-- Copiez-collez ce script dans Supabase > SQL Editor > New query
-- ============================================================

-- 1. Extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Table profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name  TEXT,
  phone      TEXT,
  role       TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Table voyages
CREATE TABLE IF NOT EXISTS public.voyages (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre               TEXT NOT NULL,
  description         TEXT,
  destination         TEXT NOT NULL,
  prix                DECIMAL(10,2),
  duree_jours         INT,
  places_disponibles  INT DEFAULT 0,
  image_url           TEXT,
  actif               BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Table dossiers
CREATE TABLE IF NOT EXISTS public.dossiers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  voyage_id       UUID REFERENCES public.voyages(id) ON DELETE SET NULL,
  type            TEXT NOT NULL CHECK (type IN ('voyage_organise', 'sur_mesure', 'visa')),
  statut          TEXT NOT NULL DEFAULT 'en_attente'
                  CHECK (statut IN ('en_attente','en_etude','confirme','paye','termine','annule')),
  message_client  TEXT,
  notes_internes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Table documents
CREATE TABLE IF NOT EXISTS public.documents (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id     UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  client_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nom_fichier    TEXT NOT NULL,
  storage_path   TEXT NOT NULL,
  type_document  TEXT DEFAULT 'autre',
  uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Table historique statuts
CREATE TABLE IF NOT EXISTS public.statut_historique (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_id     UUID NOT NULL REFERENCES public.dossiers(id) ON DELETE CASCADE,
  ancien_statut  TEXT NOT NULL,
  nouveau_statut TEXT NOT NULL,
  modifie_par    UUID REFERENCES public.profiles(id),
  commentaire    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- INDEX pour la performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_dossiers_client  ON public.dossiers(client_id);
CREATE INDEX IF NOT EXISTS idx_dossiers_statut  ON public.dossiers(statut);
CREATE INDEX IF NOT EXISTS idx_documents_dossier ON public.documents(dossier_id);
CREATE INDEX IF NOT EXISTS idx_historique_dossier ON public.statut_historique(dossier_id);

-- ============================================================
-- TRIGGER : créer automatiquement le profil après inscription
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER : updated_at automatique sur dossiers
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at ON public.dossiers;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.dossiers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dossiers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.statut_historique ENABLE ROW LEVEL SECURITY;

-- Helper : est-ce un admin ?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY "profiles_own"       ON public.profiles FOR ALL USING (id = auth.uid());
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (public.is_admin());

-- voyages (lecture publique)
CREATE POLICY "voyages_public_read" ON public.voyages FOR SELECT USING (actif = true);
CREATE POLICY "voyages_admin_all"   ON public.voyages FOR ALL USING (public.is_admin());

-- dossiers
CREATE POLICY "dossiers_own"        ON public.dossiers FOR ALL USING (client_id = auth.uid());
CREATE POLICY "dossiers_admin_all"  ON public.dossiers FOR ALL USING (public.is_admin());

-- documents
CREATE POLICY "documents_own"       ON public.documents FOR ALL USING (client_id = auth.uid());
CREATE POLICY "documents_admin_all" ON public.documents FOR ALL USING (public.is_admin());

-- historique
CREATE POLICY "historique_own"      ON public.statut_historique FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.dossiers WHERE id = dossier_id AND client_id = auth.uid()));
CREATE POLICY "historique_admin_all" ON public.statut_historique FOR ALL USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKET (à créer dans le dashboard Supabase)
-- Ou exécutez ceci :
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('documents-clients', 'documents-clients', false)
-- ON CONFLICT DO NOTHING;

-- Policies storage
-- CREATE POLICY "storage_own_upload" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'documents-clients' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "storage_own_read" ON storage.objects FOR SELECT
--   USING (bucket_id = 'documents-clients' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "storage_admin_all" ON storage.objects FOR ALL
--   USING (bucket_id = 'documents-clients' AND public.is_admin());

-- ============================================================
-- TABLE pages_contenu (CGU, Politique de confidentialité)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.pages_contenu (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       TEXT UNIQUE NOT NULL,
  contenu    TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lecture publique, écriture admin seulement
ALTER TABLE public.pages_contenu ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pages_public_read" ON public.pages_contenu FOR SELECT USING (true);
CREATE POLICY "pages_admin_write" ON public.pages_contenu FOR ALL USING (public.is_admin());

-- Inserts initiaux
INSERT INTO public.pages_contenu (slug, contenu) VALUES
  ('cgu', 'Contenu des CGU à configurer dans Admin > Pages'),
  ('privacy', 'Contenu de la politique de confidentialité à configurer dans Admin > Pages')
ON CONFLICT (slug) DO NOTHING;
