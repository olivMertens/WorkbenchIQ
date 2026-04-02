# GroupaIQ — Architecture Agentique POC

> **Audience** : Direction générale, architectes d'entreprise, décideurs techniques et non-techniques
>
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
graph TB
    subgraph INPUT["📄 Document entrant"]
        DOC["PDF / Photo / Scan<br/><i>Déposé par le gestionnaire</i>"]
    end

    subgraph AGENTS["🤖 Pipeline agentique"]
        direction TB
        AD["🗂️ Agent Données<br/><i>Azure Document Intelligence<br/>Content Understanding</i>"]
        AR["🧠 Agent Risque<br/><i>Azure OpenAI GPT-4.1<br/>Analyse contextuelle</i>"]
        AP["📚 Agent Police<br/><i>PostgreSQL pgvector<br/>RAG sur polices Groupama</i>"]

        AD --> AR --> AP
    end

    subgraph OUTPUT["📊 Résultat"]
        direction LR
        DASH["Dashboard<br/><i>Extraction, analyse,<br/>citations polices</i>"]
        REPORT["Rapport PDF<br/><i>Décision documentée<br/>avec sources</i>"]
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
    subgraph PERSONAS["👥 Personas GroupaIQ"]
        direction TB
        P1["🏠 Sinistres Habitation<br/><i>Déclaration sinistre MRH</i>"]
        P2["🚗 Sinistres Auto<br/><i>Constat + photos dommages</i>"]
        P3["💊 Sinistres Santé<br/><i>Factures hospitalières</i>"]
        P4["📋 Souscription<br/><i>Questionnaire santé / APS</i>"]
        P5["🏦 Souscription Hypothécaire<br/><i>Dossier emprunteur</i>"]
    end

    subgraph PIPELINE["⚙️ Pipeline commune"]
        CU["Document Intelligence"]
        GPT["GPT-4.1"]
        RAG["RAG Polices"]
        CU --> GPT --> RAG
    end

    subgraph POLICIES["📚 Polices Groupama"]
        direction TB
        POL1["Conditions Gén.<br/>Habitation"]
        POL2["Conditions Gén.<br/>Auto / Flotte"]
        POL3["Complémentaire<br/>Santé"]
        POL4["Souscription<br/>Santé"]
    end

    PERSONAS --> PIPELINE
    PIPELINE --> POLICIES

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
graph TB
    subgraph CLIENT["🖥️ Frontend"]
        NEXT["Next.js 14<br/><i>App Router, React 18<br/>Tailwind CSS, next-intl (fr)</i>"]
    end

    subgraph API["⚡ Backend"]
        FAST["FastAPI<br/><i>Python 3.11<br/>Gunicorn + Uvicorn</i>"]
    end

    subgraph AZURE["☁️ Services Azure"]
        direction TB
        CU["Azure Document Intelligence<br/><i>Content Understanding<br/>Extraction champs structurés</i>"]
        OPENAI["Azure OpenAI<br/><i>GPT-4.1 (analyse)<br/>text-embedding-3-large</i>"]
        BLOB["Azure Blob Storage<br/><i>Documents, résultats,<br/>données Customer 360</i>"]
        PG["PostgreSQL 16 + pgvector<br/><i>Polices vectorisées<br/>Recherche sémantique RAG</i>"]
    end

    subgraph DEPLOY["🚀 Déploiement"]
        ACR["Azure Container Registry"]
        ACA_API["Container App — API"]
        ACA_FE["Container App — Frontend"]
    end

    CLIENT -->|"API REST + API Key"| API
    API --> CU
    API --> OPENAI
    API --> BLOB
    API --> PG
    ACR --> ACA_API
    ACR --> ACA_FE

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

## 5. RAG — Recherche dans les polices Groupama

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

## 6. Customer 360 — Vue client unifiée

Le persona **Client 360** agrège les données de tous les workflows en une vue unifiée par client.

```mermaid
graph TB
    subgraph SOURCES["📋 Données par persona"]
        direction LR
        S1["🏠 Sinistre Habitation<br/>GRP-001"]
        S2["📋 Souscription MRH<br/>GRP-001"]
        S3["💊 Sinistre Santé<br/>GRP-016"]
    end

    C360["🎯 Customer 360<br/><i>Vue unifiée client</i>"]

    subgraph VIEW["📊 Résultat"]
        direction LR
        V1["Profil client"]
        V2["Timeline parcours"]
        V3["Corrélations risques"]
        V4["Résumé par persona"]
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

## 7. Sécurité et gouvernance

| Aspect | Implémentation POC |
|--------|-------------------|
| **Authentification API** | API Key (min 32 caractères) |
| **Stockage** | Azure Blob Storage (résidence France Central) |
| **Réseau** | Container Apps avec HTTPS |
| **Données sensibles** | Pas de données réelles en POC |
| **CI/CD** | GitHub Actions + OIDC (pas de secret client) |
| **Observabilité** | Logs applicatifs + health check `/` |

---

## 8. Métriques POC

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
