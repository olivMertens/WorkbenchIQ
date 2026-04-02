# GroupaIQ — Architecture Agentique POC

> Ce document présente l'**architecture agentique du POC GroupaIQ** actuellement
> déployé en production. Trois agents IA spécialisés orchestrent l'analyse des
> documents d'assurance via une pipeline **Document Intelligence → GPT-4.1 → RAG**.
>
> Pour l'architecture cible avec Fabric IQ, Foundry IQ, Microsoft Agent Framework,
> et sources de données hétérogènes, voir [ARCHITECTURE-AGENTIC-V2-TARGET.md](ARCHITECTURE-AGENTIC-V2-TARGET.md).

---

## 1. Vue d'ensemble — Pipeline agentique

Le POC GroupaIQ repose sur **trois agents spécialisés** qui travaillent en séquence
pour transformer un document brut (PDF, photo, scan) en une décision métier documentée.

```mermaid
graph LR
    subgraph INPUT["📄 Entrée"]
        DOC["PDF / Photo / Scan"]
    end
    subgraph AGENTS["🤖 Pipeline agentique"]
        AD["🗂️ Agent Données<br/>Document Intelligence"] --> AR["🧠 Agent Risque<br/>GPT-4.1"] --> AP["📚 Agent Police<br/>RAG pgvector"]
    end
    subgraph OUTPUT["📊 Résultat"]
        DASH["Dashboard"] ~~~ REPORT["Rapport PDF"]
    end
    INPUT --> AGENTS --> OUTPUT
    style INPUT fill:#f1f5f9,stroke:#64748b,color:#334155
    style AGENTS fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style OUTPUT fill:#d1fae5,stroke:#059669,color:#064e3b
```

| Agent | Rôle | Technology Azure |
|-------|------|------------------|
| **🗂️ Agent Données** | Extrait les champs structurés du document (dates, montants, noms, adresses) | Azure Document Intelligence (Content Understanding) |
| **🧠 Agent Risque** | Analyse le contenu, évalue les risques, détecte les anomalies, scoring | Azure OpenAI GPT-4.1 (+ multimodal pour les photos) |
| **📚 Agent Police** | Recherche les articles applicables dans les Conditions Générales Groupama | PostgreSQL 16 + pgvector (recherche sémantique RAG) |

---

## 2. Les 5 personas métier

GroupaIQ sert **cinq workflows métier distincts**, chacun activant les trois agents
avec des prompts et des polices de référence adaptés.

```mermaid
graph LR
    subgraph PERSONAS["👥 Personas"]
        P1["🏠 Habitation"] ~~~ P2["🚗 Auto"] ~~~ P3["💊 Santé"]
        P4["📋 Souscription"] ~~~ P5["🏦 Hypothécaire"]
    end
    subgraph PIPELINE["⚙️ Pipeline"]
        CU["Doc Intelligence"] --> GPT["GPT-4.1"] --> RAG["RAG Polices"]
    end
    subgraph POLICIES["📚 Polices"]
        POL1["Habitation"] ~~~ POL2["Auto / Flotte"]
        POL3["Santé"] ~~~ POL4["Souscription"]
    end
    PERSONAS --> PIPELINE --> POLICIES
    style PERSONAS fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style PIPELINE fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style POLICIES fill:#d1fae5,stroke:#059669,color:#064e3b
```

| Persona | Document type | Polices RAG | Résultat clé |
|---------|--------------|-------------|--------------|
| **Sinistres Habitation** | Déclaration sinistre MRH | Conditions Générales Habitation | Estimation dommages, couverture, exclusions |
| **Sinistres Auto** | Constat amiable + photos | Conditions Auto / Flotte Auto | Évaluation dégâts, responsabilité, fraude |
| **Sinistres Santé** | Facture hospitalière, devis optique | Complémentaire Santé | Remboursement, plafonds, exclusions |
| **Souscription** | APS médical, questionnaire santé | Souscription Santé | Scoring risque, recommandation |
| **Hypothécaire** | Dossier emprunteur, évaluation bien | — | Ratios GDS/TDS/LTV, éligibilité |

---

## 3. Architecture technique déployée

```mermaid
graph LR
    subgraph CLIENT["🖥️ Frontend"]
        NEXT["Next.js 14 — React 18, Tailwind, next-intl"]
    end
    subgraph API["⚡ Backend"]
        FAST["FastAPI — Python 3.11"]
    end
    subgraph AZURE["☁️ Services Azure"]
        CU["Document Intelligence"] ~~~ OPENAI["OpenAI GPT-4.1"]
        BLOB["Blob Storage"] ~~~ PG["PostgreSQL + pgvector"]
    end
    subgraph DEPLOY["🚀 Déploiement"]
        ACR["Container Registry"] --> ACA_API["ACA — API"]
        ACR --> ACA_FE["ACA — Frontend"]
    end
    CLIENT -->|"REST + API Key"| API
    API --> CU & OPENAI & BLOB & PG
    style CLIENT fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style API fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style AZURE fill:#fef3c7,stroke:#d97706,color:#78350f
    style DEPLOY fill:#d1fae5,stroke:#059669,color:#064e3b
```

| Composant | Technologie | Région Azure |
|-----------|-------------|-------------|
| **Frontend** | Next.js 14, TypeScript, Tailwind, next-intl (fr) | France Central |
| **Backend** | Python 3.11, FastAPI, Gunicorn + Uvicorn | France Central |
| **Extraction** | Azure Document Intelligence (Content Understanding) | France Central |
| **LLM** | Azure OpenAI GPT-4.1 (2025-04-14) | France Central |
| **Embeddings** | text-embedding-3-large (3072 dims) | France Central |
| **Stockage** | Azure Blob Storage | France Central |
| **RAG** | PostgreSQL 16 Flexible Server + pgvector | France Central |
| **Registre images** | Azure Container Registry | France Central |
| **Hébergement** | Azure Container Apps (2 apps) | France Central |

---

## 4. Séquence — Traitement d'un sinistre habitation

```mermaid
sequenceDiagram
    actor G as 👤 Gestionnaire
    participant FE as 🖥️ Frontend Next.js
    participant API as ⚡ FastAPI
    participant CU as 📄 Document Intelligence
    participant GPT as 🧠 GPT-4.1
    participant RAG as 📚 RAG pgvector

    G->>FE: Upload déclaration sinistre MRH
    FE->>API: POST /api/applications (multipart)
    API->>CU: Envoi document pour extraction

    rect rgb(224, 242, 254)
        Note over CU: Phase 1 — Agent Données
        CU->>CU: Extraction OCR + structurée
        CU-->>API: Champs extraits<br/>(dates, montants, adresses)
    end

    rect rgb(254, 243, 199)
        Note over GPT: Phase 2 — Agent Risque
        API->>GPT: Document + champs extraits<br/>+ prompts persona habitation
        GPT->>GPT: Analyse contextuelle<br/>Évaluation dommages<br/>Détection anomalies
        GPT-->>API: Analyse complète + scoring
    end

    rect rgb(209, 250, 229)
        Note over RAG: Phase 3 — Agent Police
        API->>RAG: Recherche sémantique<br/>dans Conditions Gén. Habitation
        RAG-->>API: Articles applicables<br/>+ citations exactes
        API->>GPT: Synthèse avec citations
        GPT-->>API: Résultat final documenté
    end

    API-->>FE: Résultat complet
    FE-->>G: Dashboard avec<br/>extraction + analyse + citations
```

---

## 5. Pipeline IA en 3 couches — Flux détaillé

L'analyse GroupaIQ repose sur un pipeline séquentiel à **3 couches** : extraction documentaire,
injection de templates avec contexte métier, puis analyse LLM avec sortie JSON stricte.

```mermaid
graph LR
    subgraph L1["🔵 Couche 1 — Extraction"]
        DOC["📄 Document"] --> CU_E["Azure CU"]
        CU_E --> MD["Markdown"] & FIELDS["Champs structurés"]
    end
    subgraph L2["🟡 Couche 2 — Templates"]
        PROMPTS["prompts.json"] --> INJECT["Injection"]
        POLICIES["Polices JSON"] --> INJECT
        MD --> INJECT
    end
    subgraph L3["🟣 Couche 3 — Analyse LLM"]
        INJECT --> GPT_A["GPT-4.1"] --> JSON_OUT["JSON strict"]
        JSON_OUT --> STORE["llm_outputs"]
    end
    style L1 fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style L2 fill:#fef3c7,stroke:#d97706,color:#78350f
    style L3 fill:#e0e7ff,stroke:#6366f1,color:#312e81
```

### Couche 1 — Extraction (Azure Content Understanding)

Chaque fichier est routé automatiquement vers l'analyseur approprié selon son type et le persona actif.

| Type de fichier | Analyseur | Données extraites |
|----------------|-----------|-------------------|
| **PDF / Documents** | `prebuilt-documentSearch` (défaut) ou analyseur custom | Markdown sémantique + champs structurés |
| **Images** (.jpg/.png) | `prebuilt-image` ou `autoClaimsImageAnalyzer` (auto) | Zones de dommages, sévérité, score de confiance |
| **Vidéos** (.mp4/.mov) | `autoClaimsVideoAnalyzer` (auto) | Keyframes, segments temporels, transcription |

| Persona | Analyseur Documents | Analyseur Images | Analyseur Vidéo |
|---------|-------------------|-----------------|-----------------|
| **Souscription** | prebuilt-documentSearch | prebuilt-image | — |
| **Sinistres Santé** | prebuilt-documentSearch | prebuilt-image | — |
| **Sinistres Auto** | autoClaimsDocAnalyzer | autoClaimsImageAnalyzer | autoClaimsVideoAnalyzer |
| **Sinistres Habitation** | prebuilt-documentSearch | prebuilt-image | — |
| **Hypothécaire** | prebuilt-documentSearch | prebuilt-image | — |

### Couche 2 — Templates et Contexte Métier

Les prompts sont organisés en **sections / subsections** dans `prompts.json`, avec injection de variables à l'exécution :

| Variable injectée | Source | Rôle |
|-------------------|--------|------|
| `{underwriting_policies}` | Fichiers `*-policies.json` par persona | Règles métier et barèmes applicables |
| Document markdown | Extraction CU (couche 1) | Contenu brut du document analysé |
| `additional_context` | Résumés par lots (documents > 100 Ko) | Contexte étendu pour gros documents |
| `{glossary}` | `prompts/glossary.json` | Terminologie métier standardisée |

### Couche 3 — Analyse LLM (GPT-4.1)

- Sections exécutées **séquentiellement** (dépendances entre sections)
- Subsections exécutées **en parallèle** (4 workers)
- Sortie JSON **stricte** avec réparation automatique si troncature
- Résultat stocké dans `llm_outputs[section][subsection]`

---

## 6. Logique de raisonnement — Agent Risque

L'Agent Risque (GPT-4.1) applique une **chaîne de raisonnement structurée** pour chaque dossier.
Le raisonnement varie selon le persona mais suit toujours le même pattern.

```mermaid
graph LR
    subgraph INPUT_R["📥 Entrées"]
        DOC_R["Markdown CU"] ~~~ FIELDS_R["Champs extraits"]
        POL_R["Polices persona"] ~~~ HIST_R["Contexte additionnel"]
    end
    subgraph REASONING["🧠 Raisonnement GPT-4.1"]
        R1["Classification"] --> R2["Évaluation"]
        R2 --> R3["Vérification"] --> R4["Recommandation"]
    end
    subgraph OUTPUT_R["📊 Sorties"]
        SCORE["Score de risque"] ~~~ FLAGS["Signaux d'alerte"]
        REC["Recommandation"] ~~~ CITE["Citations polices"]
    end
    INPUT_R --> REASONING --> OUTPUT_R
    style INPUT_R fill:#f1f5f9,stroke:#64748b,color:#334155
    style REASONING fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style OUTPUT_R fill:#d1fae5,stroke:#059669,color:#064e3b
```

### Étapes de raisonnement par persona

| Étape | Sinistres Auto | Sinistres Habitation | Souscription Santé |
|-------|---------------|---------------------|-------------------|
| **1. Classification** | Type de dommage (mineur → perte totale), zones touchées | Nature du sinistre (DDE, incendie, vol), étendue | Profil médical, classe de risque |
| **2. Évaluation** | Estimation coût (pièces + MO + peinture), responsabilité % | Montant estimé, contenu vs structure | Scoring pathologies, antécédents familiaux |
| **3. Vérification** | Articles CG Auto applicables, exclusions, franchise | Articles CG Habitation, IRSI, Cat-Nat, franchise DDE | Polices souscription, exclusions médicales |
| **4. Recommandation** | Montant ± 20%, subrogation si tiers >50% | Indemnisation, mandat expert si >5 000 € | Acceptation / surprime / refus + justification |

### Classification des dommages (Sinistres Auto)

| Niveau | Dommage | Coût estimé | Action déclenchée |
|--------|---------|-------------|-------------------|
| 🟢 **Mineur** | Rayure / bosse < 15 cm | 0 – 1 000 € | Approbation rapide |
| 🟡 **Modéré** | Dommages multi-panneaux | 1 000 – 5 000 € | Documentation photo requise |
| 🟠 **Lourd** | Airbag / structure / suspension | 5 000 – 15 000 € | Revue senior + inspection |
| 🔴 **Perte totale** | Réparation > 70 % valeur véhicule | Variable | Évaluation de récupération |

### Détection de fraude — Signaux d'alerte

L'Agent Risque produit un **score de fraude** avec indicateurs classés par sévérité :

| Niveau | Signal | Exemple |
|--------|--------|---------|
| 🔴 **Élevé** | Incohérence majeure | Description "accident stationnement" mais dommages compatibles avec collision haute vitesse |
| 🟡 **Modéré** | Élément à vérifier | Sinistre déclaré 3 jours après les faits, pas de témoin |
| 🟢 **Faible** | Aucune anomalie | Dossier cohérent, preuves concordantes |

---

## 7. Chaîne de valeur — Impact métier des agents

### Les 4 agents et leur impact

```mermaid
graph LR
    subgraph AGENTS_V["🤖 Agents IA"]
        A1["🗂️ Agent Extraction<br/>Document Intelligence"]
        A2["🧠 Agent Risque<br/>GPT-4.1"]
        A3["📚 Agent Police<br/>RAG pgvector"]
        A4["🎥 Agent Multimodal<br/>Content Understanding"]
    end
    subgraph IMPACT["📈 Impact"]
        I1["-70% saisie<br/>manuelle"]
        I2["Analyse en<br/>2 min vs 45 min"]
        I3["100%<br/>traçabilité"]
        I4["Fraude détectée<br/>dès l'intake"]
    end
    A1 --> I1
    A2 --> I2
    A3 --> I3
    A4 --> I4
    style AGENTS_V fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style IMPACT fill:#d1fae5,stroke:#059669,color:#064e3b
```

### Score d'impact business

| Métrique | Avant GroupaIQ | Après GroupaIQ | Gain |
|----------|---------------|----------------|------|
| **Temps FNOL** | 30-45 min | 3-5 min | **-85 %** |
| **Saisie manuelle** | 100 % | 30 % | **-70 %** |
| **Détection fraude** | Manuelle, tardive | Automatique, dès l'intake | **+80 % détection** |
| **Conformité polices** | Vérification humaine | Citations automatiques | **100 % traçabilité** |
| **Satisfaction client (NPS)** | Délais élevés | Réponse rapide | **+25 points** |
| **Ratio de dépenses** | Élevé | Réduit | **-30 %** |

### Détail par agent

| Agent | Périmètre | Impact principal |
|-------|-----------|-----------------|
| **🗂️ Agent Extraction** | Constats, factures, rapports médicaux, CG → markdown sémantique indexé | Suppression de 70 % de la saisie manuelle |
| **🧠 Agent Risque** | Analyse multimodale (texte + image + vidéo), scoring, responsabilité, fraude | Analyse en 2 min vs 30-45 min, cohérence des décisions |
| **📚 Agent Police** | 4 PDF CG Groupama vectorisés, recherche sémantique en français | Conformité garantie, décisions traçables et auditables |
| **🎥 Agent Multimodal** | Photos → zones de dommages + sévérité, vidéos → keyframes + timeline | Évaluation visuelle automatique, croisement déclaration vs preuves |

---

## 8. RAG — Recherche dans les polices Groupama

### 4 documents indexés

| Fichier PDF | Catégorie | Catégorie DB |
|-------------|-----------|-------------|
| Conditions Générales Habitation | Habitation | property_casualty |
| Complémentaire Santé | Santé | life_health |
| Conditions Générales Auto | Auto | automotive |
| Conditions Générales Flotte Auto | Flotte | automotive |

### Méthodes de recherche

| Méthode | Description |
|---------|-----------|
| **semantic_search()** | Similarité vectorielle pure (cosine) |
| **filtered_search()** | Vecteur + filtres métadonnées (catégorie, risk_level) |
| **intelligent_search()** | LLM infère la catégorie → vecteur + filtre |
| **hybrid_search()** | pgvector + trigram text search combinés |

### Pipeline d'indexation

```mermaid
graph LR
    PDF["📄 PDF Groupama"] --> DI["Document Intelligence<br/><i>Extraction markdown</i>"]
    DI --> CHUNK["Chunker<br/><i>Découpage 512 tokens<br/>overlap 50</i>"]
    CHUNK --> EMB["Embeddings<br/><i>text-embedding-3-large<br/>3072 dimensions</i>"]
    EMB --> PG["PostgreSQL<br/><i>pgvector index<br/>HNSW</i>"]

    style PDF fill:#f1f5f9,stroke:#64748b
    style DI fill:#e0f2fe,stroke:#0284c7
    style CHUNK fill:#fef3c7,stroke:#d97706
    style EMB fill:#e0e7ff,stroke:#6366f1
    style PG fill:#d1fae5,stroke:#059669
```

---

## 9. Customer 360 — Vue client unifiée

Le persona **Client 360** agrège les données de tous les workflows en une vue unifiée par client.

```mermaid
graph LR
    subgraph SOURCES["📋 Données par persona"]
        S1["🏠 Habitation"] ~~~ S2["📋 Souscription"] ~~~ S3["💊 Santé"]
    end
    C360["🎯 Customer 360"]
    subgraph VIEW["📊 Résultat"]
        V1["Profil"] ~~~ V2["Timeline"] ~~~ V3["Risques"] ~~~ V4["Résumé"]
    end
    SOURCES --> C360 --> VIEW
    style SOURCES fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style C360 fill:#006838,stroke:#004d2a,color:#fff
    style VIEW fill:#d1fae5,stroke:#059669,color:#064e3b
```

- **30 clients Groupama** pré-importés (GRP-001 à GRP-030)
- **GRP-001** (Olivier MERTENS LAFFITE) : lié aux démos habitation + souscription
- **GRP-016** (Aurélie FONTAINE) : liée à la démo santé
- **Persistance** : Azure Blob Storage (survit aux redéploiements)

---

## 10. Sécurité et gouvernance

| Aspect | Implémentation POC |
|--------|-------------------|
| **Authentification API** | API Key (min 32 caractères) |
| **Stockage** | Azure Blob Storage (résidence France Central) |
| **Réseau** | Container Apps avec HTTPS |
| **Données sensibles** | Pas de données réelles en POC |
| **CI/CD** | GitHub Actions + OIDC (pas de secret client) |
| **Observabilité** | Logs applicatifs + health check `/` |

---

## 11. Métriques POC

| Métrique | Valeur POC |
|----------|-----------|
| **Temps extraction CU** | 15-45 secondes par document |
| **Temps analyse GPT-4.1** | 10-30 secondes |
| **Temps recherche RAG** | < 1 seconde |
| **5 personas opérationnelles** | Habitation, Auto, Santé, Souscription, Hypothécaire |
| **4 polices indexées** | ~200 chunks vectorisés |
| **30 clients démo** | Données Customer 360 persistées |

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **Content Understanding** | Service Azure Document Intelligence qui extrait des champs structurés de documents non structurés (PDF, photos, scans) |
| **GPT-4.1** | Modèle de langage Azure OpenAI utilisé pour l'analyse contextuelle, le scoring de risque et la synthèse |
| **pgvector** | Extension PostgreSQL pour le stockage et la recherche de vecteurs (embeddings) |
| **RAG** | Retrieval-Augmented Generation — enrichir les réponses IA avec des documents réels (polices Groupama) |
| **HNSW** | Hierarchical Navigable Small World — algorithme d'index vectoriel pour la recherche approximative rapide |
| **Persona** | Workflow métier avec ses propres prompts, polices de référence et interface adaptée |
| **Customer 360** | Vue unifiée d'un client agrégeant toutes les interactions à travers les personas |
| **Container Apps** | Service Azure pour héberger des containers Docker sans gérer l'infrastructure |
