# CRM SOS — Machine Commerciale
## Soutien-Omni-Scolaire

CRM sur mesure pour piloter l'acquisition, la conversion, la rétention et la réactivation des familles. Conçu spécifiquement pour les 4 centres SOS en Suisse romande.

---

## Stack technique

- **Next.js 14** (App Router) — Frontend + API dans un seul projet
- **Prisma ORM** — Gestion de la base de données
- **SQLite** (développement) / **PostgreSQL** (production)
- **Tailwind CSS** — Design premium SOS (navy + gold)
- **TypeScript** — Typage strict

---

## Installation locale — Guide pas-à-pas

### Étape 1 : Installer Node.js

1. Aller sur **https://nodejs.org**
2. Télécharger la version **LTS** (bouton vert)
3. Installer (suivre l'assistant, tout laisser par défaut)
4. Vérifier l'installation : ouvrir un terminal et taper :
   ```
   node --version
   ```
   Tu dois voir un numéro de version (ex: v20.12.0). Si ça ne marche pas, redémarrer le terminal.

### Étape 2 : Ouvrir le terminal dans le dossier du projet

**Sur Mac :**
- Ouvrir le Finder, naviguer jusqu'au dossier `crm-sos`
- Clic droit → "Nouveau terminal au dossier"

**Sur Windows :**
- Ouvrir l'Explorateur, naviguer jusqu'au dossier `crm-sos`
- Cliquer dans la barre d'adresse, taper `cmd` et appuyer sur Entrée

### Étape 3 : Installer et lancer

Copier-coller ces commandes **une par une** dans le terminal :

```bash
# 1. Installer toutes les dépendances
npm install

# 2. Initialiser la base de données + créer les données de test
npm run setup

# 3. Lancer l'application
npm run dev
```

### Étape 4 : Ouvrir le CRM

Ouvrir le navigateur et aller sur : **http://localhost:3000**

Le CRM est opérationnel avec des données de test (leads, familles, tâches, campagnes).

---

## Les 10 modules

| # | Module | URL | Description |
|---|--------|-----|-------------|
| 1 | **Dashboard** | `/` | Vue d'ensemble : compteurs, entonnoir de conversion, tâches du jour, derniers leads |
| 2 | **Leads** | `/leads` | Liste des prospects avec scoring, filtres par statut/source/centre |
| 3 | **Pipeline** | `/pipeline` | Vue kanban 6 colonnes : Nouveau → Contacté → Qualifié → En attente → Converti / Perdu |
| 4 | **Détail Lead** | `/leads/[id]` | Fiche complète : scoring interactif, historique d'interactions, conversion en famille |
| 5 | **Familles** | `/familles` | Liste des familles actives avec score de fidélité, nombre d'élèves, inscriptions |
| 6 | **Détail Famille** | `/familles/[id]` | Fiche famille : élèves, inscriptions, historique, valeur client estimée |
| 7 | **Tâches** | `/taches` | Relances et suivis avec filtres, marquage rapide, indicateurs de retard |
| 8 | **Campagnes** | `/campagnes` | Suivi des campagnes saisonnières (Rentrée, ECR, Stages) avec objectifs et progression |
| 9 | **Analytique** | `/analytique` | Performance par centre, taux de conversion, sources les plus efficaces |
| 10 | **Ambassadeurs** | `/ambassadeurs` | Programme de parrainage premium : classement Gold/Silver/Bronze, tracking des recommandations |

---

## 4 centres SOS

| Code | Centre |
|------|--------|
| TM | Thônex Moillesulaz |
| LM | Lausanne Malley |
| TY | Thônex Yverdon |
| LY | Lausanne Yverdon |

Chaque page permet de filtrer les données par centre.

---

## Offres SOS

| Code | Offre |
|------|-------|
| CI | Cours Individuels |
| ES | Études Surveillées |
| CSP | Cours Semi-Privé |
| SH | Sessions Hebdomadaires |
| SI | Stage Intensif |

---

## Données de test incluses

Le seed crée automatiquement :
- 4 centres (TM, LM, TY, LY)
- 3 utilisateurs (admin, responsable, assistant)
- 3 campagnes saisonnières
- 8 leads à différents statuts avec scoring
- 4 familles avec score de fidélité
- 6 élèves avec inscriptions
- Interactions et tâches réalistes

Pour recharger les données de test à tout moment :
```bash
npm run db:seed
```

---

## Déploiement en production (Vercel + Supabase — gratuit)

### A. Créer la base de données PostgreSQL

1. Aller sur **https://supabase.com** → créer un compte gratuit
2. Cliquer **New Project** → choisir un nom (ex: `crm-sos`) et un mot de passe
3. Attendre que le projet se crée (~2 min)
4. Aller dans **Settings → Database** → copier l'**URI** (Connection string)
   - Elle ressemble à : `postgresql://postgres:motdepasse@db.xxxxx.supabase.co:5432/postgres`

### B. Préparer le code pour la production

Dans le fichier `prisma/schema.prisma`, changer la ligne :
```
provider = "sqlite"
```
par :
```
provider = "postgresql"
```

### C. Mettre le code sur GitHub

1. Créer un compte sur **https://github.com** si tu n'en as pas
2. Créer un nouveau repository (ex: `crm-sos`, privé)
3. Dans le terminal, depuis le dossier `crm-sos` :
   ```bash
   git init
   git add .
   git commit -m "CRM SOS v1"
   git remote add origin https://github.com/TON_NOM/crm-sos.git
   git push -u origin main
   ```

### D. Déployer sur Vercel

1. Aller sur **https://vercel.com** → créer un compte gratuit (se connecter avec GitHub)
2. Cliquer **Add New → Project**
3. Sélectionner le repository `crm-sos`
4. Dans **Environment Variables**, ajouter :
   - `DATABASE_URL` = l'URI PostgreSQL copiée depuis Supabase
5. Cliquer **Deploy**
6. Attendre ~2 min → ton CRM est en ligne avec une URL publique

### E. Initialiser la base de production

Après le premier déploiement, ouvrir le terminal localement :
```bash
# Mettre l'URL de production dans .env temporairement
DATABASE_URL="postgresql://postgres:motdepasse@db.xxxxx.supabase.co:5432/postgres" npx prisma db push
DATABASE_URL="postgresql://postgres:motdepasse@db.xxxxx.supabase.co:5432/postgres" npx tsx prisma/seed.ts
```

---

## Structure du projet

```
crm-sos/
├── prisma/
│   ├── schema.prisma          # 9 modèles de données
│   └── seed.ts                # Données de test réalistes
├── src/
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── layout.tsx             # Layout (sidebar + header)
│   │   ├── globals.css            # Design SOS (navy + gold)
│   │   ├── leads/                 # Pages leads (liste + détail)
│   │   ├── pipeline/              # Vue kanban
│   │   ├── familles/              # Pages familles (liste + détail)
│   │   ├── taches/                # Tâches et relances
│   │   ├── campagnes/             # Campagnes saisonnières
│   │   ├── analytique/            # Tableaux de bord analytiques
│   │   ├── ambassadeurs/          # Programme ambassadeurs
│   │   └── api/                   # 20 endpoints API
│   ├── components/
│   │   ├── layout/                # Sidebar + Header
│   │   └── leads/                 # Modales (nouveau lead, conversion, interaction)
│   ├── lib/
│   │   ├── prisma.ts              # Client Prisma singleton
│   │   └── utils.ts               # Labels, scoring, formatage
│   └── types/
│       └── index.ts               # Interfaces TypeScript
├── package.json
├── tailwind.config.ts             # Couleurs SOS (navy + gold)
├── tsconfig.json
└── .env                           # URL base de données
```

---

## API — 20 endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/dashboard` | Stats globales + entonnoir + revenus estimés |
| GET/POST | `/api/leads` | Liste / création de leads |
| GET/PUT/DELETE | `/api/leads/[id]` | Détail / modification / suppression lead |
| POST | `/api/leads/[id]/convert` | Conversion lead → famille + élève + inscription |
| GET/POST | `/api/familles` | Liste / création de familles |
| GET/PUT/DELETE | `/api/familles/[id]` | Détail famille avec élèves et inscriptions |
| POST | `/api/eleves` | Création élève |
| GET/PUT/DELETE | `/api/eleves/[id]` | Détail élève |
| POST | `/api/inscriptions` | Création inscription |
| PUT/DELETE | `/api/inscriptions/[id]` | Modification inscription |
| GET/POST | `/api/interactions` | Liste / création interactions |
| PUT/DELETE | `/api/interactions/[id]` | Modification interaction |
| GET/POST | `/api/taches` | Liste / création tâches |
| GET/PUT/DELETE | `/api/taches/[id]` | Détail tâche |
| GET/POST | `/api/campagnes` | Liste / création campagnes |
| GET/PUT/DELETE | `/api/campagnes/[id]` | Détail campagne |
| GET | `/api/analytique` | Données analytiques par centre |
| GET | `/api/ambassadeurs` | Classement ambassadeurs |
| GET | `/api/centres` | Liste des 4 centres |
| GET | `/api/utilisateurs` | Liste des utilisateurs |

---

## Commandes utiles

```bash
npm run dev          # Lancer en mode développement (http://localhost:3000)
npm run build        # Compiler pour la production
npm start            # Lancer en mode production
npm run setup        # Initialiser la base + données de test (première fois)
npm run db:seed      # Recharger les données de test
npm run db:push      # Appliquer les changements de schéma
npm run db:generate  # Regénérer le client Prisma
```

---

## Pipeline commercial (6 statuts)

```
Nouveau → Contacté → Qualifié → En attente → Converti ✓
                                             → Perdu ✗
```

Raisons de perte trackées : Prix, Timing, Trouvé ailleurs, Ne répond plus, Pas de créneau.

---

## Scoring commercial (sur 20 points)

Chaque lead est évalué sur 4 critères (1 à 5 points chacun) :
- **Urgence** — Besoin immédiat vs planification future
- **Budget** — Capacité financière estimée
- **Réactivité** — Rapidité de réponse du prospect
- **Potentiel** — Multi-offres, multi-enfants, fidélisation possible

Score total affiché avec code couleur : vert (≥15), orange (≥10), rouge (<10).

---

## Programme Ambassadeurs

| Palier | Condition | Récompense |
|--------|-----------|------------|
| 🥇 Gold | 5+ recommandations converties | 1 mois offert |
| 🥈 Silver | 3-4 recommandations converties | 50% réduction 1 mois |
| 🥉 Bronze | 1-2 recommandations converties | 10% réduction |

Tracking automatique via le champ `recommandeParId` sur chaque lead.
