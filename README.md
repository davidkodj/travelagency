# VoyageElite — Guide de déploiement

## Stack technique
- **Frontend** : Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend** : Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Emails** : Resend
- **Hébergement** : Vercel (gratuit)
- **i18n** : next-intl (FR + EN)

---

## ÉTAPE 1 — Supabase (30 min)

### 1.1 Créer le projet
1. https://supabase.com → "New project"
2. Nom : `voyageelite` | Région : **West EU (Ireland)**
3. Attendez ~2 min

### 1.2 Exécuter le schéma SQL
1. Menu → **SQL Editor** → "New query"
2. Collez **tout** le fichier `supabase-schema.sql`
3. Cliquez **Run** → doit afficher "Success"

### 1.3 Créer le bucket Storage
1. Menu → **Storage** → "New bucket"
2. Nom : `documents-clients` | **décochez** "Public bucket"
3. Save

### 1.4 Policies Storage (SQL Editor)
```sql
CREATE POLICY "storage_own_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents-clients' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_own_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents-clients' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "storage_admin_all" ON storage.objects FOR ALL
  USING (bucket_id = 'documents-clients' AND public.is_admin());
```

### 1.5 Récupérer vos clés
Menu → **Settings** → **API** :
- `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (GARDEZ-LA SECRÈTE)

---

## ÉTAPE 2 — Resend (10 min)

1. https://resend.com → créer un compte
2. **API Keys** → "Create API Key" → copiez la clé
3. (Optionnel) **Domains** → ajoutez votre domaine

---

## ÉTAPE 3 — Local (20 min)

```bash
# Dans le dossier du projet
npm install

# Copier et remplir les variables d'environnement
cp .env.local.example .env.local
# Éditez .env.local avec vos vraies valeurs

# Lancer en local
npm run dev
# → http://localhost:3000
```

**Tests à faire en local :**
- [ ] Page d'accueil s'affiche (FR + EN)
- [ ] Inscription → email de confirmation
- [ ] Connexion → redirection dashboard
- [ ] Mot de passe oublié → email reçu
- [ ] Soumission dossier → apparaît dans Supabase
- [ ] Upload document → visible dans Storage

---

## ÉTAPE 4 — GitHub + Vercel (15 min)

```bash
git init
git add .
git commit -m "Initial commit — VoyageElite"

# Créer un dépôt sur github.com (privé recommandé)
git remote add origin https://github.com/VOTRE-COMPTE/voyageelite.git
git branch -M main
git push -u origin main
```

**Sur https://vercel.com :**
1. "Add New Project" → importez votre dépôt GitHub
2. **Environment Variables** → ajoutez toutes les variables :

| Variable | Valeur |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://xxx.supabase.co |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | eyJ... |
| `SUPABASE_SERVICE_ROLE_KEY` | eyJ... |
| `RESEND_API_KEY` | re_... |
| `FROM_EMAIL` | noreply@votredomaine.com |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | 22890000000 |
| `NEXT_PUBLIC_SITE_URL` | https://votresite.vercel.app |
| `NEXT_PUBLIC_GA_ID` | G-XXXXXXXXXX (optionnel) |

3. "Deploy" → ~2 minutes → votre site est en ligne

---

## ÉTAPE 5 — Créer votre compte admin (5 min)

1. Allez sur votre site → inscrivez-vous avec votre email
2. Dans Supabase → **Table Editor** → `profiles`
3. Trouvez votre ligne → double-cliquez `role` → changez en `super_admin`
4. Reconnectez-vous → redirection vers `/admin`

---

## ÉTAPE 6 — Configurer les pages CGU/Privacy

1. Connectez-vous en tant qu'admin
2. Menu admin → **Pages CGU/Privacy**
3. Rédigez vos textes légaux
4. Sauvegardez → visible sur `/terms` et `/privacy`

---

## Mises à jour

```bash
# Après chaque modification
git add .
git commit -m "Description du changement"
git push
# Vercel redéploie automatiquement en ~2 min
```

---

## Budget

| Phase | Clients | Coût |
|-------|---------|------|
| Démarrage | 0–500 | **0€/mois** |
| Croissance | 500–1000 | ~25$/mois (Supabase Pro) |
| Scale | 1000+ | ~45$/mois |

---

## Structure du projet

```
src/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx              ← Accueil (tunnel de vente)
│   │   ├── auth/
│   │   │   ├── login/            ← Connexion
│   │   │   ├── register/         ← Inscription
│   │   │   ├── forgot/           ← Mot de passe oublié
│   │   │   └── reset-password/   ← Réinitialisation
│   │   ├── dashboard/
│   │   │   ├── page.tsx          ← Tableau de bord client
│   │   │   └── nouveau-dossier/  ← Soumission dossier
│   │   ├── admin/
│   │   │   ├── page.tsx          ← Dashboard admin
│   │   │   ├── dossiers/         ← Liste + détail dossiers
│   │   │   ├── voyages/          ← CRUD voyages
│   │   │   ├── utilisateurs/     ← Gestion rôles
│   │   │   └── pages/            ← CGU + Privacy
│   │   ├── voyages/              ← Catalogue public
│   │   ├── contact/              ← Page contact
│   │   ├── privacy/              ← Politique confidentialité
│   │   └── terms/                ← CGU
│   └── api/
│       └── emails/               ← Routes d'envoi email
├── components/
│   ├── ui/                       ← shadcn/ui components
│   ├── layout/                   ← Navbar, Footer
│   ├── sections/                 ← Sections homepage
│   └── shared/                   ← WhatsApp float
├── lib/
│   └── supabase/                 ← Clients browser + server
├── hooks/                        ← use-toast
├── types/                        ← TypeScript types
├── i18n.ts                       ← Config i18n
└── middleware.ts                 ← Auth + i18n routing
messages/
├── fr.json                       ← Traductions FR
└── en.json                       ← Traductions EN
supabase-schema.sql               ← Script BDD complet
```
