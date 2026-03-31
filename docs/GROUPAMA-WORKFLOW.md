# GroupaIQ — Workflow de Traitement des Sinistres Groupama

## Vue d'ensemble

GroupaIQ est un poste de travail IA qui accélère le traitement des sinistres assurance en automatisant l'extraction de données, l'analyse de dommages, la détection de fraude et la recherche de polices — le tout alimenté par Azure AI et les conditions générales Groupama indexées par RAG.

Ce document décrit comment **chaque étape du workflow sinistres** est prise en charge par l'application et comment les **connecteurs IA et agents** génèrent de la valeur pour Groupama.

---

## Architecture IA du Workflow

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  Documents   │───▶│  Azure AI     │───▶│  Azure OpenAI  │───▶│  PostgreSQL  │
│  Photos      │    │  Document     │    │  GPT-4.1       │    │  pgvector    │
│  Vidéos      │    │  Intelligence │    │  Embeddings    │    │  RAG Index   │
└─────────────┘    └──────────────┘    └───────────────┘    └──────────────┘
       │                   │                    │                    │
       │            Extraction            Analyse IA          Recherche
       │            structurée            contextuelle        sémantique
       ▼                   ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          GroupaIQ Frontend                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │Souscript.│  │Sinistres │  │Sinistres │  │Hypothéc. │  │Client 360│ │
│  │          │  │  Santé   │  │  Auto    │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Les 8 Étapes du Workflow Sinistres

### Étape 1 — Incident (Potentiel IA : Faible)

**Rôle humain** : Capture des données sur le terrain (constat, photos, vidéo)

**Ce que GroupaIQ apporte** :
- **Upload multimodal** : Le gestionnaire télécharge photos, vidéos et PDF du sinistre directement dans l'interface
- **Extraction vidéo** : Les vidéos sont analysées avec extraction automatique de keyframes (avant/pendant/après l'incident)
- **Horodatage intelligent** : Détection automatique du moment de l'incident dans la vidéo

**Comment utiliser** :
1. Ouvrir GroupaIQ → sélectionner le persona **Sinistres Auto**
2. Cliquer **+ Nouveau dossier**
3. Glisser-déposer les fichiers (constat PDF, photos dommages, vidéo dashcam)
4. Le système démarre automatiquement le traitement

---

### Étape 2 — FNOL / Déclaration de sinistre (Potentiel IA : Élevé)

**Rôle de l'agent IA** :
- Collecte initiale automatisée des données
- Vérification de couverture contre les conditions générales Groupama
- Extraction des formulaires et documents
- Vérification initiale de cohérence

**Ce que GroupaIQ apporte** :
- **Document Intelligence** : Azure AI extrait automatiquement les champs clés (nom assuré, numéro de police, date d'incident, description) depuis les PDF et formulaires
- **Vérification de couverture RAG** : Les 4 polices Groupama indexées (Habitation, Santé, Auto, Flotte Auto) sont interrogées automatiquement pour confirmer que le sinistre est couvert
- **Ask IQ (Chat IA)** : Le gestionnaire peut poser des questions en langage naturel : *"Ce type de sinistre est-il couvert par l'article 3 des conditions générales auto ?"*

**Connecteur données** :
```
PDF sinistre ──▶ Document Intelligence ──▶ Champs structurés
                                              │
Polices Groupama (RAG) ◀──────────────────────┘
     │                                    Vérification
     ▼                                    automatique
"Article 3.2 - Garantie RC :              de couverture
 Les dommages causés aux tiers..."
```

**Gain Groupama** : Réduction de 70% du temps de saisie manuelle, vérification instantanée de la couverture

---

### Étape 3 — Analyse du Sinistre (Potentiel IA : Élevé)

**Rôle de l'agent IA** :
- Collecte et évaluation complète des données
- Demande de documents complémentaires
- Détermination de la responsabilité
- Évaluation du montant et du calendrier

**Ce que GroupaIQ apporte** :
- **Évaluation des dommages à 4 niveaux** :
  | Niveau | Dommage | Coût estimé | Action |
  |--------|---------|-------------|--------|
  | Mineur | Rayure/bosse <15cm | 0–1 000€ | Approbation rapide |
  | Modéré | Dommages multi-panneaux | 1 000–5 000€ | Documentation photo requise |
  | Lourd | Airbag/structure/suspension | 5 000–15 000€ | Revue senior + inspection |
  | Perte totale | Réparation >70% valeur véhicule | Variable | Évaluation de récupération |

- **Détermination de responsabilité** : Calcul automatique du pourcentage de faute (assuré vs tiers) avec citations des articles applicables
- **Estimation de réparation** : Extraction ligne par ligne des postes de réparation (pièces, main d'œuvre, peinture)
- **Analyse d'images IA** : Détection automatique des zones de dommages sur les photos avec boîtes englobantes et scores de confiance

**Comment utiliser** :
1. Après upload → l'onglet **Aperçu** affiche le résumé IA complet
2. L'onglet **Documents** montre les extractions par fichier
3. Le panneau **Évaluation des risques** détaille la responsabilité et les dommages
4. Cliquer sur **Analyse des polices** pour voir les citations Groupama applicables

**Gain Groupama** : Analyse complète en 2-3 minutes au lieu de 30-45 minutes manuellement

---

### Étape 4 — Détection de Fraude (Potentiel IA : Élevé)

**Rôle de l'agent IA** :
- Modèles de détection d'anomalies
- Vérification contre l'historique des sinistres
- Interrogation des bases de données externes de fraude

**Ce que GroupaIQ apporte** :
- **Indicateurs d'alerte automatiques** : L'IA identifie les signaux de fraude potentielle avec niveaux de confiance
  - 🔴 **Élevé** : Incohérences majeures (description vs dommages constatés, timing suspect)
  - 🟡 **Modéré** : Éléments nécessitant une vérification complémentaire
  - 🟢 **Faible** : Aucune anomalie détectée
- **Référence SIU** : Flag automatique pour référencement à l'Unité Spéciale d'Investigation
- **Croisement documentaire** : L'IA compare les déclarations textuelles avec les preuves visuelles pour détecter les incohérences

**Connecteur données** :
```
Déclaration (texte) ──┐
                      ├──▶ GPT-4.1 ──▶ Score de fraude + indicateurs
Photos/Vidéo (visuel) ┘         │
                                ▼
                        Polices Groupama (RAG)
                        "Article 8 - Déclaration
                         frauduleuse : nullité du contrat"
```

**Gain Groupama** : Détection précoce des sinistres suspects, réduction des pertes liées à la fraude

---

### Étape 5 — Règlement du Sinistre (Potentiel IA : Moyen)

**Rôle humain** : Revue des refus, sélection du cours d'action
**Rôle de l'agent IA** : Recommandation de règlement, sélection du partenaire

**Ce que GroupaIQ apporte** :
- **Recommandation de paiement** : Montant recommandé avec fourchette min/max (±20%) et justification détaillée
- **Ajustements automatiques** : Prise en compte des dommages préexistants, de l'âge du véhicule, des pièces OEM vs compatibles
- **Décision du gestionnaire** : Interface pour approuver, refuser ou demander une revue complémentaire avec notes d'audit
- **Traçabilité complète** : Chaque décision est horodatée et liée aux citations de police applicables

**Comment utiliser** :
1. Dans l'onglet **Aperçu**, consulter la section **Recommandation de règlement**
2. Vérifier le montant recommandé et les ajustements
3. Cliquer **Approuver** / **Refuser** / **Référer** avec des notes
4. La décision est enregistrée avec horodatage pour l'audit

---

### Étape 6 — Subrogation (Potentiel IA : Moyen)

**Ce que GroupaIQ apporte** :
- **Détermination de responsabilité** : Pourcentage de faute assuré/tiers calculé automatiquement
- **Potentiel de subrogation** : Flag `subrogation_potential = true` quand la responsabilité du tiers est >50%
- **Documentation automatique** : Toutes les preuves (photos, vidéos, déclarations) sont consolidées et liées au dossier

**Connecteur données pour Groupama** :
```
Responsabilité tiers >50% ──▶ Flag subrogation ──▶ Alerte gestionnaire
                                                        │
Citation Article 4.1 CG Auto ◀─────────────────────────┘
"Recours contre le tiers responsable..."
```

---

### Étape 7 — Ajustements de Police / Souscription (Potentiel IA : Élevé)

**Rôle de l'agent IA** : Déterminer et mettre en œuvre les ajustements de police

**Ce que GroupaIQ apporte** :
- **Recherche sémantique dans les polices Groupama** : Les 4 PDF de conditions générales indexés par Document Intelligence + embeddings permettent une recherche contextuelle précise
- **Citations de police** : Chaque recommandation est accompagnée de l'article exact des CG Groupama applicable avec le texte source
- **Onglet Souscription** : Persona dédié pour les analystes de souscription avec vue complète sur l'historique du risque

**Comment utiliser** :
1. Basculer vers le persona **Souscription**
2. Utiliser **Ask IQ** : *"Quelles sont les exclusions de garantie pour les véhicules de plus de 10 ans selon les CG Auto Groupama ?"*
3. Le système retourne les articles pertinents avec le texte exact et le score de pertinence

**Gain Groupama** : Les ajustements de police sont documentés et traçables, réduction des erreurs d'interprétation

---

### Étape 8 — Administration Financière (Potentiel IA : Moyen)

**Ce que GroupaIQ apporte** :
- **Résumé consolidé** : Vue agrégée de tous les postes de dépense par sinistre
- **Audit trail** : Historique complet des décisions (qui, quand, quel montant, quelle justification)
- **Détection de conflits** : Alerte quand des informations extraites de différents documents se contredisent

---

## Flux de Démonstration Recommandé

### Scénario 1 : Sinistre Habitation — Inondation Cave à Vin

**Durée de la démo : 8 minutes**
**Persona : Sinistres Habitation**

**Fichiers à uploader :**
- `declaration_sinistre_cave.pdf` — Déclaration de sinistre avec circonstances (inondation cave à vin)
- `photo_degats_cave_1.jpg` — Photo des dégâts des eaux dans la cave
- `photo_degats_cave_2.jpg` — Photo du stockage de vin endommagé
- `facture_cave_vin.pdf` — Facture d'achat / inventaire du contenu de la cave
- `devis_reparation_cave.pdf` — Devis de remise en état (plomberie, peinture, électricité)

#### Écran après traitement Content Understanding

Après upload, le système affiche le **ProcessingBanner** animé :
1. 🔵 *"Data Agent extracting documents..."* (extraction des champs)
2. 🟣 *"Risk Agent analyzing case..."* (analyse IA)

Au bout de ~2 min, toast de succès → navigation automatique vers la **Vue d'ensemble** (onglet par défaut) :

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  BARRE D'EN-TÊTE (indigo)                                                    │
│  Branche: Habitation MRH │ Cause: Dégâts des eaux │ Assuré: DUPONT Marie     │
│  Indemnisé: — │ Frais d'expert: — │ Total estimé: 12 500 € │ Réserve: —     │
│  [Convention IRSI] [Cat-Nat possible] [Garantie DDE] [Sinistre majeur]       │
└──────────────────────────────────────────────────────────────────────────────┘

┌─ RANGÉE 1 ──────────────────────────────────────────────────────────────────┐
│                                                                              │
│  ┌── Notes de responsabilité ──┐ ┌── Données extraites ───┐ ┌── Tâches ──┐ │
│  │ [AI] Résumé IA généré par   │ │ NumeroSinistre: SIN-.. │ │ ☐ Vérifier │ │
│  │ GPT-4.1 : analyse de        │ │ NomAssure: DUPONT M.   │ │   couvert. │ │
│  │ l'inondation, cause,        │ │ NumeroPolice: HAB-GRP.. │ │   CG Habit.│ │
│  │ étendue des dommages au     │ │ NatureSinistre: Dégâts │ │ ☐ Mandater │ │
│  │ contenu (cave à vin),       │ │   des eaux              │ │   expert   │ │
│  │ vérification couverture.    │ │ DateSinistre: 28/03/26 │ │   si >5000€│ │
│  │                             │ │ MontantDevis: 12500.00 │ │ ☐ Franchise│ │
│  │ Si pas de LLM outputs →     │ │ AdresseRisque: 14 rue  │ │   DDE 250€ │ │
│  │ Accordion dépliable :       │ │   des Vignes, 33000    │ │            │ │
│  │ "Évaluation responsabilité" │ │   Bordeaux             │ │ [Générer   │ │
│  │ + "Signaux d'alerte"        │ │ DescriptionDommages:   │ │  note de   │ │
│  │                             │ │   Inondation cave...   │ │  règlement]│ │
│  └─────────────────────────────┘ └────────────────────────┘ └────────────┘ │
│                                                                              │
├─ RANGÉE 2 ──────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Chronologie ──────────────┐ ┌── Dommages constatés ─────────────────┐ │
│  │ 📍 28/03 Couverture         │ │ Champ             Valeur     Lié ?    │ │
│  │   declaration_sinistre_cave │ │ MontantDevis      12500.00   Oui      │ │
│  │ 📍 28/03 Dommages           │ │ NatureSinistre    Dégâts..   Oui      │ │
│  │   photo_degats_cave_1.jpg   │ │ ContenuEndommage  Bouteilles Oui      │ │
│  │ 📍 28/03 Dommages           │ │ ValeurContenu     8200.00    Possible │ │
│  │   photo_degats_cave_2.jpg   │ │ CauseFuite        Canalisa.. Oui      │ │
│  │ 📍 28/03 Réparation         │ │                                       │ │
│  │   devis_reparation_cave.pdf │ │                                       │ │
│  └─────────────────────────────┘ └───────────────────────────────────────┘ │
│                                                                              │
├─ RANGÉE 3 (pleine largeur) ─────────────────────────────────────────────────┤
│                                                                              │
│  ┌── Pièces & Documents ────────────────────────────────────────────────────┐│
│  │ Document source              Type       ✓  ✗  Résumé              Voir  ││
│  │ 📄 declaration_sinistre_cave Couverture ✓     Déclaration sinistre [🔗] ││
│  │ 🖼️ photo_degats_cave_1.jpg   Dommages   ✓     Preuves photo       [🔗] ││
│  │ 🖼️ photo_degats_cave_2.jpg   Dommages   ✓     Preuves photo       [🔗] ││
│  │ 📄 facture_cave_vin.pdf      Réparation ✓     Facture/inventaire  [🔗] ││
│  │ 📄 devis_reparation_cave.pdf Réparation ✓     Devis réparation    [🔗] ││
│  └──────────────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────────┘
```

**Onglets supplémentaires disponibles** (barre TopNav) :
| Onglet | Contenu |
|--------|---------|
| **Vue d'ensemble** | Écran ci-dessus (par défaut) |
| **Chronologie** | Vue pleine largeur `ChronologicalOverview` — timeline des fichiers |
| **Documents** | `DocumentsPanel` — liste des fichiers avec extractions détaillées par document |
| **Pages source** | `SourceReviewView` — markdown brut extrait par Document Intelligence |

**Chat IA (Ask IQ)** — tiroir latéral disponible sur tous les onglets :
> *"Les dégâts des eaux dans ma cave à vin sont-ils couverts par les CG Habitation Groupama ?"*
> → Réponse avec citation de l'article applicable + score de pertinence

```
Temps    Action                                    Onglet / Persona
──────   ─────────────────────────────────────────  ─────────────────
0:00     Connexion → Page d'accueil GroupaIQ        Login
0:30     Sélectionner persona "Sinistres Habitation" TopNav
1:00     + Nouveau dossier → Upload 5 fichiers      Dashboard
         (déclaration, 2 photos, facture, devis)
1:15     ⏳ ProcessingBanner animé                   Dashboard
         "Data Agent extracting documents..."
         "Risk Agent analyzing case..."
2:30     ✅ Toast "Analyse terminée" → auto-nav      Vue d'ensemble
3:00     Barre indigo : Habitation MRH, DDE,         Vue d'ensemble
         montant total estimé, badges IRSI/Cat-Nat
3:30     Notes de responsabilité (résumé IA)          Vue d'ensemble
         + Données extraites (10 champs clés)
4:00     Chronologie : timeline des 5 fichiers        Vue d'ensemble
         + Dommages constatés (tableau)
4:30     Pièces & Documents : 5 fichiers classés      Vue d'ensemble
         par type (Couverture/Dommages/Réparation)
5:00     Onglet Pages source → voir le markdown       Pages source
         brut extrait par Document Intelligence
5:30     Ask IQ → "Ma cave à vin est-elle couverte   Chat IA
         par les CG Habitation Groupama ?"
         → Citation exacte de la police
6:30     Cocher les tâches de vérification            Vue d'ensemble
         → Générer note de règlement
7:30     Basculer "Client 360" → vue consolidée       Client 360
```

---

### Scénario 2 : Sinistre Auto Groupama

**Durée de la démo : 10 minutes**

```
Temps    Action                                    Onglet / Persona
──────   ─────────────────────────────────────────  ─────────────────
0:00     Connexion → Page d'accueil GroupaIQ        Login
0:30     Sélectionner persona "Sinistres Auto"      TopNav
1:00     + Nouveau dossier → Upload constat PDF     Dashboard
         + Photos de dommages + vidéo dashcam
1:30     ⏳ Traitement IA automatique               Dashboard
         (Document Intelligence + GPT-4.1)
3:00     Voir résultats → Onglet Aperçu             Aperçu
         - Résumé véhicule extrait
         - Évaluation dommages (sévérité + coût €)
         - Score de responsabilité
         - Indicateurs de fraude
4:00     Onglet Documents → Voir extractions        Documents
         détaillées par fichier
5:00     Onglet Chronologie → Timeline vidéo        Chronologie
         avec keyframes pré/pendant/post incident
6:00     Ask IQ → "Ce sinistre est-il couvert      Chat IA
         par l'article 3 des CG Auto Groupama ?"
         → Réponse avec citation exacte de la
         police indexée
7:00     Voir recommandation de règlement           Aperçu
         → Montant + ajustements + citations
8:00     Décision : Approuver avec notes            Aperçu
9:00     Basculer persona "Souscription"            TopNav
         → Voir l'impact sur le profil de risque
10:00    Client 360 → Vue consolidée                Client 360
         cross-persona
```

---

## Valeur des Agents IA et Connecteurs pour Groupama

### 1. Agent d'Extraction Documentaire
```
📄 Azure Document Intelligence (prebuilt-documentSearch)
   │
   ├── Constats amiables → Extraction des champs structurés
   ├── Factures réparation → Postes ligne par ligne
   ├── Rapports médicaux → Données patient structurées
   └── Conditions Générales → Markdown sémantique indexé
```
**Impact** : Suppression de 70% de la saisie manuelle

### 2. Agent d'Analyse IA (GPT-4.1)
```
🤖 Azure OpenAI GPT-4.1
   │
   ├── Analyse multimodale (texte + image + vidéo)
   ├── Évaluation des dommages avec classification
   ├── Détermination de responsabilité
   ├── Détection de fraude (red flags)
   └── Recommandation de règlement chiffrée
```
**Impact** : Analyse en 2 min vs 30-45 min, cohérence des décisions

### 3. Connecteur RAG (Polices Groupama)
```
📚 PostgreSQL + pgvector
   │
   ├── CG Habitation Groupama (property_casualty)
   ├── Complémentaire Santé Groupama (life_health)
   ├── CG Auto Groupama (automotive)
   └── CG Flotte Auto Groupama (automotive)
   │
   └──▶ Recherche sémantique en français
        → Citations exactes des articles applicables
```
**Impact** : Conformité garantie, décisions traçables et auditables

### 4. Connecteur Multimodal (Photos + Vidéos)
```
🎥 Azure Content Understanding
   │
   ├── Photos → Zones de dommages + sévérité + confiance
   ├── Vidéos → Keyframes + timeline d'événements
   └── Bounding boxes → Localisation précise des dommages
```
**Impact** : Évaluation visuelle automatique, détection de fraude croisée (déclaration vs preuves)

---

## Score d'Impact Business

| Métrique | Avant GroupaIQ | Après GroupaIQ | Gain |
|----------|---------------|----------------|------|
| Temps de traitement FNOL | 30-45 min | 3-5 min | **-85%** |
| Saisie manuelle | 100% | 30% | **-70%** |
| Détection fraude précoce | Manuelle | Automatique | **+80% détection** |
| Conformité polices | Vérification manuelle | Citations automatiques | **100% traçabilité** |
| Satisfaction client (NPS) | Délais élevés | Réponse rapide | **+25 points** |
| Ratio de dépenses | Élevé | Réduit | **-30%** |

---

## Commande de Démarrage

```bash
# Lancer en local avec Docker Compose
cp .env.example .env   # Remplir les endpoints Azure
docker compose up --build

# Indexer les polices Groupama
python scripts/index_pdf_policies.py --force

# Ouvrir http://localhost:3000
```

---

## Endpoints API Principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/claims/submit` | Soumettre un nouveau sinistre |
| POST | `/{claim_id}/upload` | Ajouter des fichiers |
| POST | `/{claim_id}/process` | Déclencher l'analyse IA |
| GET | `/{claim_id}/assessment` | Obtenir l'évaluation complète |
| PUT | `/{claim_id}/assessment/decision` | Décision du gestionnaire |
| POST | `/api/claims/policies/search` | Recherche sémantique de polices |
| GET | `/api/personas` | Liste des personas disponibles |
| POST | `/api/applications` | Créer un dossier (souscription) |
| POST | `/api/chat` | Ask IQ — chat contextuel |
| GET | `/api/prompts?persona=X` | Récupérer les prompts d'un persona |
| PUT | `/api/prompts/{section}/{subsection}` | Modifier un prompt |
| POST | `/api/prompts/{section}/{subsection}` | Créer un nouveau prompt |
| DELETE | `/api/prompts/{section}/{subsection}` | Supprimer un prompt |

---

## Architecture Interne : Système de Prompts et Content Understanding

### Pipeline de Traitement en 3 Couches

L'analyse IA de GroupaIQ repose sur un pipeline séquentiel à 3 couches :

```
┌─────────────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  Couche 1       │     │  Couche 2             │     │  Couche 3        │
│  EXTRACTION CU  │ ──▶ │  TEMPLATES PROMPTS    │ ──▶ │  ANALYSE LLM     │
│                 │     │                       │     │                  │
│  Azure Content  │     │  prompts.json         │     │  GPT-4.1         │
│  Understanding  │     │  (sections/subsections)│    │  STRICT JSON out │
│                 │     │                       │     │                  │
│  → Markdown     │     │  + {underwriting_     │     │  Résultat stocké │
│  → Champs       │     │     policies}         │     │  dans llm_outputs│
│    structurés   │     │  + document_markdown  │     │  [section]       │
│  → Data confiance│    │  + additional_context  │     │  [subsection]    │
└─────────────────┘     └──────────────────────┘     └──────────────────┘
```

### Couche 1 — Content Understanding (Azure CU)

**Point d'entrée** : `run_content_understanding_for_files()`

Pour chaque fichier uploadé, le système route automatiquement vers l'analyseur approprié :

| Type de fichier | Analyseur | Données extraites |
|----------------|-----------|-------------------|
| PDF / Documents | `prebuilt-documentSearch` (défaut) ou analyseur custom | Markdown + champs structurés |
| Images (.jpg/.png) | `prebuilt-image` ou `autoClaimsImageAnalyzer` (auto) | Zones de dommages, sévérité, confiance |
| Vidéos (.mp4/.mov) | `autoClaimsVideoAnalyzer` (auto) | Keyframes, segments, transcription |

**Analyseurs par persona** :

| Persona | Analyseur Documents | Analyseur Images | Analyseur Vidéo |
|---------|-------------------|-----------------|-----------------|
| Souscription | prebuilt-documentSearch | prebuilt-image | — |
| Sinistres Santé | prebuilt-documentSearch | prebuilt-image | — |
| Sinistres Auto | autoClaimsDocAnalyzer | autoClaimsImageAnalyzer | autoClaimsVideoAnalyzer |
| Sinistres Habitation | prebuilt-documentSearch | prebuilt-image | — |
| Hypothécaire | prebuilt-documentSearch | prebuilt-image | — |

**Schéma de champs par persona** (défini dans `app/personas.py`) :

| Persona | Schéma de champs | Focus extraction |
|---------|-----------------|------------------|
| Souscription | `UNDERWRITING_FIELD_SCHEMA` | Nom, date naissance, tension artérielle, lipides, antécédents familiaux, médicaments |
| Sinistres Santé | `LIFE_HEALTH_CLAIMS_FIELD_SCHEMA` | Détails sinistre, codes diagnostic, traitements, preuves médicales |
| Sinistres Auto | `AUTOMOTIVE_CLAIMS_FIELD_SCHEMA` + IMAGE + VIDEO | Véhicule, zones de dommages, réparations, responsabilité |
| Hypothécaire | `MORTGAGE_FIELD_SCHEMA` | Propriété, revenus, emploi, actifs |

**Résultat agrégé stocké dans `ApplicationMetadata`** :
- `document_markdown` — Markdown concaténé de tous les fichiers
- `extracted_fields` — Clé format `filename:FieldName` avec valeur + confiance
- `cu_raw_results` — Résultats bruts CU pour débogage

### Couche 2 — Templates de Prompts

**Structure hiérarchique** (fichier `prompts.json`) :

```
prompts.json (par persona)
├── application_summary (section)          ← Profil du client
│   ├── customer_profile (subsection)      ← Prompt template
│   └── existing_policies (subsection)     ← Prompt template
├── medical_summary (section)              ← Analyse médicale
│   ├── family_history
│   ├── hypertension
│   ├── high_cholesterol
│   ├── other_medical_findings
│   ├── body_system_review
│   ├── abnormal_labs
│   └── latest_vitals
└── requirements (section)                 ← Recommandations
    └── requirements_summary
```

**Variables injectées dans chaque prompt** :

| Variable | Source | Quand |
|----------|--------|-------|
| `{underwriting_policies}` | `prompts/*-policies.json` | Remplacée à l'exécution dans `_run_single_prompt()` |
| Document markdown | Extrait par CU | Ajouté comme `user_prompt` après le template |
| `additional_context` | Résumés par lots (mode gros doc) | Documents > 100 Ko |
| `{glossary}` | `prompts/glossary.json` | Prêt mais pas encore injecté dans le pipeline de base |

**Exécution** (`run_underwriting_prompts()`) :
1. Charger les prompts du persona (fichier custom ou défauts `personas.py`)
2. Détecter le mode : `standard` (< 100 Ko) ou `large_document` (> 100 Ko)
3. Charger polices + glossaire + contexte additionnel
4. Exécuter les sections **séquentiellement**, subsections **en parallèle** (4 workers)
5. Parser le JSON strict renvoyé par GPT-4.1 (avec réparation troncature si nécessaire)
6. Stocker dans `llm_outputs[section][subsection]`

### Couche 3 — Administration des Prompts (Admin UI)

L'onglet **Agent Skills** de la page Admin permet de gérer tous les prompts :

| Opération | Endpoint | Méthode | Effet |
|-----------|----------|---------|-------|
| Lister les prompts | `/api/prompts?persona=X` | GET | Charge tous les section/subsection |
| Modifier un prompt | `/api/prompts/{s}/{ss}?persona=X` | PUT | Application immédiate au prochain traitement |
| Créer un prompt | `/api/prompts/{s}/{ss}?persona=X` | POST | Nouvelle subsection dans la section |
| Supprimer un prompt | `/api/prompts/{s}/{ss}?persona=X` | DELETE | Retour au prompt par défaut |

**Points clés** :
- Les modifications sont **immédiates** — pas de redémarrage nécessaire
- Supprimer un prompt personnalisé → le prompt par défaut est restauré automatiquement
- Chaque persona a ses propres prompts indépendants

---

## Vision : Migration vers Microsoft Agent Framework

### Architecture Actuelle vs Architecture Agentique

**Aujourd'hui** : Pipeline séquentiel rigide — CU lance toujours en premier, tous les prompts s'exécutent systématiquement, pas de raisonnement dynamique.

**Demain (Agent Framework)** : Agents autonomes avec des outils — chaque agent décide quels outils appeler, peut réessayer avec une stratégie différente, et peut demander des informations complémentaires.

```
ACTUEL (pipeline séquentiel)                 FUTUR (workflow agentique)
─────────────────────────                    ─────────────────────────
CU → Prompts → LLM → Résultat               ┌──────────────┐
(ordre fixe, tout s'exécute)                 │ DocumentAgent │──┐
                                             │ • extract_doc │  │
                                             │ • extract_img │  ├──▶ WorkflowGraph
                                             └──────────────┘  │
                                             ┌──────────────┐  │
                                             │ AnalysisAgent │──┤
                                             │ • search_policy│  │
                                             │ • analyze_sect│  │
                                             │ • deep_dive   │  │
                                             └──────────────┘  │
                                             ┌──────────────┐  │
                                             │  RiskAgent   │──┘
                                             │ • evaluate   │
                                             │ • recommend  │
                                             └──────────────┘
```

### Comparaison Détaillée

| Aspect | Pipeline Actuel | Agent Framework |
|--------|----------------|-----------------|
| **Exécution des prompts** | Ordre fixe : app_summary → medical_summary → requirements | L'agent décide quoi analyser selon le contenu |
| **Sélection des prompts** | Toutes les subsections s'exécutent (même si non pertinentes) | L'agent choisit les outils pertinents : "ce doc contient des résultats labo → appeler `analyze_labs`" |
| **Gestion d'erreurs** | Réparation mécanique du JSON après échec LLM | L'agent réessaie avec une stratégie différente |
| **Extraction CU** | Étape obligatoire avant toute analyse | L'agent décide comment traiter chaque fichier, peut réessayer avec un autre analyseur |
| **Admin** | Éditer le texte brut des prompts | Éditer les instructions de l'agent + activer/désactiver les outils par persona |
| **Contexte de polices** | Injection statique `{underwriting_policies}` | L'agent appelle `search_policies("hypertension")` pour obtenir le sous-ensemble pertinent |
| **Chat (Ask IQ)** | Endpoint séparé avec RAG | Agent avec tous les outils — peut chercher des polices, analyser des documents, répondre |

### Transformation des Prompts en Outils d'Agent

```python
# ACTUEL : Template statique injecté avec des variables
prompt = prompts["medical_summary"]["hypertension"]
context = f"{prompt}\n\n{underwriting_policies}\n\n{document_markdown}"
result = chat_completion(context)  # Appel unique et rigide

# FUTUR : Agent avec fonctions @tool
from agent_framework import Agent
from agent_framework.openai import OpenAIChatClient

@tool
def analyze_hypertension(blood_pressure_readings: str, patient_age: int) -> str:
    """Analyser les relevés de tension artérielle selon les directives Groupama."""
    policies = search_policies("hypertension directives tension artérielle")
    return f"Analyse TA : {blood_pressure_readings} pour patient de {patient_age} ans"

@tool
def search_policies(query: str) -> str:
    """Rechercher les polices Groupama pour les directives pertinentes."""
    return rag_search(query, category="life_health")

analysis_agent = Agent(
    client=OpenAIChatClient(azure_endpoint=..., model="gpt-4-1"),
    name="AnalysisAgent",
    instructions=admin_editable_instructions,  # ← Même admin UI
    tools=[analyze_hypertension, search_policies, analyze_family_history, ...]
)
```

### Transformation du CU en Outil d'Agent

```python
@tool
def extract_document(file_path: str, analyzer_id: str = "prebuilt-layout") -> dict:
    """Extraire les champs structurés et markdown d'un document via Azure CU."""
    return content_understanding_client.analyze_document(file_path, analyzer_id)

@tool
def extract_image(file_path: str, analyzer_id: str = "autoClaimsImageAnalyzer") -> dict:
    """Extraire l'évaluation des dommages d'une photo via Azure CU multimodal."""
    return content_understanding_client.analyze_image(file_path, analyzer_id)

document_agent = Agent(
    name="DocumentAgent",
    instructions="""Agent de traitement documentaire pour Groupama.
    Pour chaque fichier :
    1. Déterminer le type (PDF, image, vidéo)
    2. Choisir l'analyseur approprié
    3. Si confiance faible sur un champ clé → réessayer avec un autre analyseur
    4. Retourner les résultats d'extraction structurés""",
    tools=[extract_document, extract_image, extract_video, get_field_schema]
)
```

### Évolution de l'Admin UI

| Fonctionnalité Admin | Actuel | Avec Agent Framework |
|---------------------|--------|---------------------|
| **Onglet Agent Skills** | Éditer le texte des prompts | Éditer les instructions de l'agent + activer/désactiver les outils par persona |
| **Onglet Analyzers** | Créer/supprimer des analyseurs CU | + Configurer quels analyseurs chaque agent peut utiliser |
| **Onglet Polices** | CRUD règles + indexation RAG | Exposé comme outil `search_policies` pour les agents |
| **Onglet Glossaire** | Gérer la terminologie | Exposé comme outil `get_glossary` pour la cohérence |
| **Traitement** | Upload → Extraire → Analyser (3 boutons) | Upload → "Traiter" (1 bouton, l'agent décide les étapes) |

### Plan de Migration par Phases

| Phase | Périmètre | Risque | Effort |
|-------|-----------|--------|--------|
| **Phase 0** ✅ | Corrections bugs, i18n, déploiement | Aucun | Fait |
| **Phase 1** | Convertir le chat (Ask IQ) en Agent + outils | Faible — isolé, rétrocompatible | Moyen |
| **Phase 2** | Convertir les prompts templates en outils d'Agent | Moyen — change la structure des résultats | Moyen-Élevé |
| **Phase 3** | CU comme DocumentAgent avec logique de retry | Moyen — change le flux d'extraction | Moyen |
| **Phase 4** | Orchestration complète en Workflow (document → analyse → risque) | Élevé — réécriture du pipeline | Élevé |

**Recommandation** : Démarrer par la **Phase 1** (chat comme agent) — cela donne le comportement "agentique" le plus visible en démo (le LLM raisonne sur quels outils appeler, cite les polices, pose des questions de clarification) sans toucher au pipeline extract/analyze existant. L'onglet admin "Agent Skills" évolue naturellement pour afficher les instructions de l'agent à côté des configurations d'outils.

### Considérations

1. **Agent Framework SDK est encore en RC** (rc6, pas GA). Acceptable pour une démo. Pour la production, attendre la GA (prévue Q2 2026 selon les annonces Build).
2. **Content Understanding n'a pas d'intégration native Agent Framework** — il faut écrire des wrappers `@tool` personnalisés (illustrés ci-dessus). Simple puisque le client Python CU existe déjà.
3. **L'onglet "Agent Skills" doit évoluer** pour afficher : (a) Instructions de l'agent (éditables), (b) Outils disponibles (on/off par persona), (c) Résultats avec traces d'appels d'outils (quels outils l'agent a appelé et pourquoi).
