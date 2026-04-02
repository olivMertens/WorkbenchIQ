# GroupaIQ — Architecture Agentique Cible

> **Audience** : Direction générale, architectes d'entreprise, décideurs non-techniques
>
> Ce document présente l'**architecture cible** du système GroupaIQ :
> comment le POC actuel s'étend vers une plateforme d'entreprise intégrant
> **Microsoft Fabric (FabricIQ)**, **Microsoft Foundry (FoundryIQ)**,
> des sources de données hétérogènes (SharePoint, SAP, systèmes on-premise),
> et des APIs métiers connectées.
>
> Chaque intégration a été **vérifiée dans la documentation Microsoft officielle** (avril 2026).

---

## 1. Vue d'ensemble — Architecture cible

L'architecture cible repose sur **trois couches** qui s'empilent naturellement :
les **sources de données** alimentent la **plateforme de données unifiée (FabricIQ)**,
qui nourrit la **couche agentique (FoundryIQ)** pour produire des décisions.

```mermaid
graph TB
    subgraph SOURCES["🏢 Sources de données hétérogènes"]
        direction LR
        SP["📂 SharePoint<br/><i>Polices, courriers,<br/>pièces justificatives</i>"]
        SAP["🔷 SAP<br/><i>Contrats, clients,<br/>historique sinistres</i>"]
        ONPREM["🖥️ APIs On-Premise<br/><i>SI métier Groupama,<br/>tarificateurs, GED</i>"]
        LEGACY["🗄️ Bases legacy<br/><i>Oracle, SQL Server,<br/>AS/400</i>"]
        DOCS["📄 Documents<br/><i>PDF, photos,<br/>vidéos, scans</i>"]
    end

    subgraph FABRIC["🟦 FabricIQ — Plateforme de données unifiée"]
        direction LR
        DF["Data Factory<br/><i>200+ connecteurs<br/>+ passerelle on-premise</i>"]
        OL["OneLake<br/><i>Lac de données<br/>unifié (Delta Lake)</i>"]
        IQ_F["Fabric IQ<br/><i>Ontologie métier,<br/>agents de données</i>"]
    end

    subgraph FOUNDRY["🟪 FoundryIQ — Couche agentique"]
        direction LR
        AS["Agent Service<br/><i>Orchestration,<br/>outils, identité</i>"]
        IQ_A["Foundry IQ<br/><i>Knowledge retrieval,<br/>grounding RAG</i>"]
        MODELS["Modèles IA<br/><i>GPT-4.1, embeddings,<br/>Document Intelligence</i>"]
    end

    subgraph OUTPUT["📊 Décisions métier"]
        direction LR
        O1["Souscription<br/><i>Scoring risque</i>"]
        O2["Sinistres<br/><i>Indemnisation</i>"]
        O3["Hypothécaire<br/><i>Éligibilité</i>"]
        O4["Client 360<br/><i>Vue unifiée</i>"]
    end

    SOURCES --> FABRIC
    FABRIC --> FOUNDRY
    FOUNDRY --> OUTPUT

    style SOURCES fill:#f1f5f9,stroke:#64748b,color:#334155
    style FABRIC fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style FOUNDRY fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style OUTPUT fill:#d1fae5,stroke:#059669,color:#064e3b
```

| Couche | Rôle | Produit Microsoft |
|--------|------|-------------------|
| **Sources** | Les données brutes là où elles sont aujourd'hui | SharePoint, SAP, APIs on-premise, bases SQL, documents |
| **FabricIQ** | Unifie, nettoie et gouverne toutes les données | Microsoft Fabric (Data Factory + OneLake + IQ) |
| **FoundryIQ** | Agents IA qui raisonnent sur les données unifiées | Microsoft Foundry (Agent Service + IQ + Modèles) |
| **Décisions** | Résultats métier traçables pour chaque persona | Dashboards GroupaIQ + rapports PDF |

---

## 2. Sources de données — Connecteurs vérifiés

Ce diagramme détaille **comment chaque source de données** rejoint la plateforme.
Toutes les connexions listées sont **documentées et supportées par Microsoft**.

```mermaid
flowchart LR
    subgraph ON_PREM["🏢 Réseau Groupama (On-Premise)"]
        direction TB
        SAP_HANA["🔷 SAP HANA<br/><i>Base clients &<br/>contrats</i>"]
        SAP_BW["🔷 SAP BW<br/><i>Entrepôt de<br/>données métier</i>"]
        SAP_TABLE["🔷 SAP Table<br/><i>Données<br/>transactionnelles</i>"]
        ORACLE["🗄️ Oracle DB<br/><i>Système sinistres<br/>legacy</i>"]
        SQLSRV["🗄️ SQL Server<br/><i>Tarificateurs,<br/>référentiels</i>"]
        API_REST["⚡ APIs REST<br/><i>SI métier interne,<br/>GED, workflow</i>"]
        FICHIERS["📁 Fichiers réseau<br/><i>Partages SMB,<br/>exports batch</i>"]
    end

    GW["🔐 <b>Data Gateway</b><br/><i>Passerelle sécurisée<br/>On-Premise → Cloud</i>"]

    subgraph CLOUD["☁️ Services Cloud"]
        direction TB
        SHAREPOINT["📂 SharePoint<br/><i>Documents métier,<br/>polices, courriers</i>"]
        AI_SEARCH["🔍 Azure AI Search<br/><i>Index sémantique<br/>centralisé</i>"]
        BLOB["💾 Azure Blob<br/><i>Documents téléchargés,<br/>photos, scans</i>"]
        PG["🐘 PostgreSQL<br/><i>Polices vectorisées<br/>(pgvector)</i>"]
    end

    FABRIC_DF["🟦 <b>Fabric Data Factory</b><br/><i>Orchestration &<br/>transformation</i>"]

    SAP_HANA --> GW
    SAP_BW --> GW
    SAP_TABLE --> GW
    ORACLE --> GW
    SQLSRV --> GW
    API_REST --> GW
    FICHIERS --> GW

    GW --> FABRIC_DF

    SHAREPOINT --> FABRIC_DF
    AI_SEARCH --> FABRIC_DF
    BLOB --> FABRIC_DF
    PG --> FABRIC_DF

    FABRIC_DF --> ONELAKE["🟦 <b>OneLake</b><br/><i>Source unique<br/>de vérité</i>"]

    style ON_PREM fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style GW fill:#fef3c7,stroke:#d97706,color:#78350f
    style CLOUD fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style ONELAKE fill:#006838,stroke:#004d2a,color:#fff
```

### Connecteurs SAP vérifiés dans Fabric Data Factory

| Connecteur | Mode | Passerelle | Authentification |
|-----------|------|-----------|------------------|
| **SAP HANA** | Dataflow Gen2, Pipeline, Copy Job | On-premises | Basic, Windows |
| **SAP BW Application Server** | Dataflow Gen2 | On-premises | Basic, Windows |
| **SAP BW Message Server** | Dataflow Gen2 | On-premises | Basic |
| **SAP Table Application Server** | Pipeline, Copy Job | Avec ou sans | Basic |
| **SAP Table Message Server** | Pipeline, Copy Job | Avec ou sans | Basic |
| **SAP CDC** (via ADF) | Incrémental (delta) | Azure Data Factory | ODP Framework |

### Autres connecteurs on-premise confirmés

| Source | Type | Passerelle requise |
|--------|------|--------------------|
| **Oracle Database** | Relationnelle | Oui |
| **SQL Server** | Relationnelle | Oui |
| **IBM Db2** | Relationnelle | Oui |
| **MySQL / PostgreSQL** | Relationnelle | Oui |
| **OData** | API REST | Oui |
| **ODBC / OLE DB** | Générique | Oui |
| **Fichiers / Dossiers** | Système de fichiers | Oui |
| **Teradata / Sybase** | Relationnelle | Oui |

---

## 3. FabricIQ — Plateforme de données unifiée

Microsoft Fabric centralise **toutes les données** dans OneLake et expose des capacités intelligentes via **Fabric IQ** (preview).

```mermaid
graph TB
    subgraph FABRIC_FULL["🟦 Microsoft Fabric"]
        direction TB

        subgraph INGESTION["Ingestion"]
            direction LR
            DF["Data Factory<br/><i>200+ connecteurs</i>"]
            RT["Real-Time Intelligence<br/><i>Flux en temps réel</i>"]
            MIRROR["Mirroring<br/><i>Réplication continue<br/>SQL, Cosmos DB, Snowflake</i>"]
        end

        subgraph STORAGE["Stockage unifié"]
            ONELAKE["<b>OneLake</b><br/><i>Lac de données unifié<br/>Format Delta Lake ouvert<br/>Accès zero-copy via Shortcuts</i>"]
        end

        subgraph COMPUTE["Traitement & Analyse"]
            direction LR
            DW["Data Warehouse<br/><i>SQL analytique</i>"]
            DE["Data Engineering<br/><i>Apache Spark</i>"]
            DS["Data Science<br/><i>ML & prédictions</i>"]
            PBI["Power BI<br/><i>Visualisation</i>"]
        end

        subgraph IQ_LAYER["Fabric IQ (preview)"]
            direction LR
            ONTO["Ontologie métier<br/><i>Concepts assurance<br/>standardisés</i>"]
            DA["Data Agents<br/><i>Interrogation en<br/>langage naturel</i>"]
            SEM["Semantic Models<br/><i>Métriques partagées<br/>gouvernées</i>"]
        end

        INGESTION --> STORAGE
        STORAGE --> COMPUTE
        STORAGE --> IQ_LAYER
    end

    subgraph GOVERNANCE["🔒 Gouvernance (Microsoft Purview)"]
        direction LR
        GOV1["Contrôle d'accès<br/><i>RBAC + row-level</i>"]
        GOV2["Classification<br/><i>Données sensibles</i>"]
        GOV3["Audit<br/><i>Traçabilité complète</i>"]
    end

    FABRIC_FULL --> GOVERNANCE

    style FABRIC_FULL fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style INGESTION fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style STORAGE fill:#006838,stroke:#004d2a,color:#fff
    style COMPUTE fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style IQ_LAYER fill:#c7d2fe,stroke:#6366f1,color:#312e81
    style GOVERNANCE fill:#fef3c7,stroke:#d97706,color:#78350f
```

**Fabric IQ** (preview avril 2026) apporte :
- **Ontologie** : définitions métier standardisées (« sinistre », « prime », « assuré ») partagées entre les agents
- **Data Agents** : interrogation des données en langage naturel, sans écrire de SQL
- **Semantic Models** : métriques et KPIs réutilisables et gouvernés dans toute l'organisation
- **Fabric Graph** : relations entre entités métier pour le raisonnement contextuel

---

## 4. FoundryIQ — Couche agentique

Microsoft Foundry **orchestre les agents IA** qui raisonnent sur les données unifiées par Fabric.

```mermaid
graph TB
    subgraph FOUNDRY_FULL["🟪 Microsoft Foundry"]
        direction TB

        subgraph AGENT_SERVICE["Agent Service — Runtime managé"]
            direction LR
            PA["Prompt Agents<br/><i>Configuration, sans code<br/>Prototypage rapide</i>"]
            WA["Workflow Agents<br/><i>Multi-agents, branchement<br/>Approbation humaine</i>"]
            HA["Hosted Agents<br/><i>Code custom, containers<br/>Contrôle total</i>"]
        end

        subgraph TOOLS_BUILTIN["Outils intégrés (built-in)"]
            direction LR
            T_SP["📂 SharePoint<br/><i>Recherche dans les<br/>sites & dossiers<br/>OBO auth</i>"]
            T_SEARCH["🔍 Azure AI Search<br/><i>Index sémantique<br/>full-text + vectoriel</i>"]
            T_IQ["📊 Foundry IQ<br/><i>Knowledge retrieval<br/>RAG clé en main</i>"]
            T_FABRIC["🟦 Fabric Data Agent<br/><i>Interrogation OneLake<br/>en langage naturel</i>"]
            T_MCP["🔌 MCP Servers<br/><i>Connecteurs custom<br/>APIs on-premise</i>"]
        end

        subgraph MODELS_LAYER["Catalogue de modèles"]
            direction LR
            GPT41["GPT-4.1<br/><i>Analyse contextuelle</i>"]
            DOCINT["Document Intelligence<br/><i>Extraction de champs</i>"]
            EMB["Embeddings<br/><i>Vectorisation</i>"]
        end

        subgraph ENTERPRISE["Sécurité & Observabilité"]
            direction LR
            ID["Entra ID<br/><i>Identité par agent</i>"]
            TRACE["Tracing<br/><i>Chaque décision<br/>observable</i>"]
            SAFETY["Content Safety<br/><i>Filtres & guardrails</i>"]
        end

        AGENT_SERVICE --> TOOLS_BUILTIN
        AGENT_SERVICE --> MODELS_LAYER
        AGENT_SERVICE --> ENTERPRISE
    end

    style FOUNDRY_FULL fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style AGENT_SERVICE fill:#c7d2fe,stroke:#818cf8,color:#312e81
    style TOOLS_BUILTIN fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style MODELS_LAYER fill:#fef3c7,stroke:#d97706,color:#78350f
    style ENTERPRISE fill:#d1fae5,stroke:#059669,color:#064e3b
```

### Outils Foundry vérifiés pour GroupaIQ

| Outil | Statut | Usage pour Groupama |
|-------|--------|---------------------|
| **SharePoint** | Preview (GA prévue 2026) | Accès direct aux polices et pièces dans SharePoint Groupama, avec SSO (OBO) |
| **Azure AI Search** | GA | Index sémantique des Conditions Générales (remplace pgvector à terme) |
| **Foundry IQ** | GA | Knowledge bases clé en main pour le grounding RAG des agents |
| **Fabric Data Agent** | Preview | Interrogation OneLake : données SAP, contrats, historique sinistres |
| **MCP Servers** | Preview | Pont vers les APIs REST on-premise (SI métier, GED, tarificateurs) |
| **Code Interpreter** | GA | Calculs financiers complexes (ratios GDS/TDS/LTV) |
| **Web Search** | Preview | Enrichissement externe (cours immobilier, cotes véhicules) |

---

## 5. APIs métiers On-Premise — Stratégie de connexion

Les systèmes métier Groupama sont accessibles via **deux chemins complémentaires** selon le type d'accès requis.

```mermaid
flowchart TD
    subgraph SI_GROUPAMA["🏢 SI Groupama — Systèmes métier"]
        direction TB
        GED["📁 GED<br/><i>Gestion Électronique<br/>de Documents</i>"]
        TARIF["💰 Tarificateur<br/><i>Calcul de prime<br/>en temps réel</i>"]
        SINISTRE["📋 Gestion Sinistres<br/><i>Suivi des dossiers,<br/>statuts, paiements</i>"]
        REF["📚 Référentiels<br/><i>Produits, garanties,<br/>barèmes</i>"]
        CRM["👥 CRM<br/><i>Fiche client,<br/>historique relation</i>"]
    end

    NEED{"Type d'accès<br/>requis ?"}

    subgraph BATCH["📦 Chemin Batch — Fabric Data Factory"]
        direction TB
        B1["Extraction programmée<br/><i>Quotidien / horaire</i>"]
        B2["Transformation<br/><i>Nettoyage, enrichissement</i>"]
        B3["Chargement OneLake<br/><i>Delta Lake incrémental</i>"]
    end

    subgraph REALTIME["⚡ Chemin Temps Réel — MCP / APIM"]
        direction TB
        APIM["Azure API Management<br/><i>Exposition sécurisée<br/>des APIs internes</i>"]
        MCP["MCP Server custom<br/><i>Pont Foundry ↔<br/>API on-premise</i>"]
        VPN["ExpressRoute / VPN<br/><i>Tunnel sécurisé<br/>Azure ↔ Datacenter</i>"]
    end

    SI_GROUPAMA --> NEED
    NEED -->|"Données historiques<br/>volumétrie importante"| BATCH
    NEED -->|"Appel en temps réel<br/>par un agent IA"| REALTIME

    BATCH --> ONELAKE["🟦 OneLake"]
    REALTIME --> FOUNDRY["🟪 Foundry Agent Service"]

    ONELAKE --> FOUNDRY

    style SI_GROUPAMA fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style NEED fill:#fef3c7,stroke:#d97706,color:#78350f
    style BATCH fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style REALTIME fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style ONELAKE fill:#006838,stroke:#004d2a,color:#fff
    style FOUNDRY fill:#6366f1,stroke:#4f46e5,color:#fff
```

### Exemples concrets d'intégration

| Système Groupama | Chemin | Méthode | Usage |
|-----------------|--------|---------|-------|
| **SAP (contrats)** | Batch | Data Factory → SAP HANA connector → OneLake | Données contractuelles pour Client 360 |
| **GED (documents)** | Temps réel | MCP Server → API REST GED | Agent Données récupère une pièce jointe à la volée |
| **Tarificateur** | Temps réel | APIM → API SOAP/REST interne | Agent Risque appelle le tarificateur pour valider une prime |
| **Gestion Sinistres** | Batch + Temps réel | Data Factory (historique) + MCP (statut live) | Historique dans OneLake + statut temps réel pour le gestionnaire |
| **Référentiels** | Batch | Data Factory → SQL Server → OneLake | Barèmes, produits, garanties indexés par Fabric IQ |
| **CRM** | Batch | Data Factory → Oracle/SQL → OneLake | Fiche client complète pour Client 360 |

---

## 6. Architecture cible intégrée — Flux complet

Ce diagramme montre le **flux de bout en bout** : de la donnée brute à la décision, en passant par FabricIQ et FoundryIQ.

```mermaid
flowchart TD
    subgraph SOURCES["🏢 Sources de données"]
        direction LR
        S1["📂 SharePoint"]
        S2["🔷 SAP"]
        S3["🖥️ APIs on-premise"]
        S4["🗄️ Bases legacy"]
        S5["📄 Documents"]
    end

    subgraph INGESTION["🟦 FabricIQ — Ingestion & Unification"]
        direction TB
        GW["🔐 Data Gateway<br/><i>Passerelle on-premise</i>"]
        DF["Data Factory<br/><i>Pipelines ETL</i>"]
        OL["OneLake<br/><i>Données unifiées</i>"]
        FIQ["Fabric IQ<br/><i>Ontologie + Data Agents</i>"]

        GW --> DF
        DF --> OL
        OL --> FIQ
    end

    subgraph AGENTS["🟪 FoundryIQ — Agents IA"]
        direction TB

        ORCH["<b>Orchestrateur</b><br/><i>Workflow Agent</i>"]

        subgraph AGENTS_3["Les 3 agents spécialisés"]
            direction LR
            AD["🗂️ Agent Données<br/><i>Extraction</i>"]
            AR["🧠 Agent Risque<br/><i>Analyse</i>"]
            AP["📚 Agent Police<br/><i>Conformité</i>"]
        end

        subgraph TOOLS["Outils connectés"]
            direction LR
            T1["SharePoint<br/><i>Documents live</i>"]
            T2["AI Search<br/><i>Index polices</i>"]
            T3["Fabric Agent<br/><i>Données OneLake</i>"]
            T4["MCP Server<br/><i>APIs métier</i>"]
        end

        ORCH --> AGENTS_3
        AGENTS_3 --> TOOLS
    end

    subgraph DELIVERY["📊 Livraison"]
        direction LR
        DASH["Dashboard<br/>GroupaIQ"]
        REPORT["Rapports<br/>PDF"]
        TEAMS["Microsoft<br/>Teams"]
        PBI["Power BI<br/>Analytique"]
    end

    SOURCES --> INGESTION
    INGESTION --> AGENTS
    S1 -.->|"Accès direct<br/>OBO auth"| T1
    S3 -.->|"Appel temps réel<br/>MCP/APIM"| T4
    AGENTS --> DELIVERY

    style SOURCES fill:#f1f5f9,stroke:#64748b,color:#334155
    style INGESTION fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
    style AGENTS fill:#e0e7ff,stroke:#6366f1,color:#312e81
    style AGENTS_3 fill:#c7d2fe,stroke:#818cf8,color:#312e81
    style TOOLS fill:#dbeafe,stroke:#3b82f6,color:#1e3a5f
    style DELIVERY fill:#d1fae5,stroke:#059669,color:#064e3b
```

---

## 7. POC actuel vs Architecture cible

```mermaid
graph LR
    subgraph POC["🟢 POC GroupaIQ (actuel)"]
        direction TB
        P1["Upload manuel<br/>de documents"]
        P2["Azure Document<br/>Intelligence"]
        P3["Azure OpenAI<br/>GPT-4.1"]
        P4["PostgreSQL<br/>pgvector (RAG)"]
        P5["Dashboard<br/>Next.js"]

        P1 --> P2 --> P3 --> P4 --> P5
    end

    ARROW["<b>ÉVOLUTION</b><br/><br/>Le POC a validé<br/>le pipeline agentique.<br/><br/>L'architecture cible<br/>ajoute les sources<br/>entreprise et la<br/>gouvernance."]

    subgraph TARGET["🔵 Architecture cible"]
        direction TB
        T1["Données multi-sources<br/>SAP + SharePoint + Legacy"]
        T2["FabricIQ<br/>OneLake + Data Factory"]
        T3["FoundryIQ<br/>Agent Service + Workflow"]
        T4["AI Search + Fabric IQ<br/>(remplace pgvector)"]
        T5["Dashboard + Teams<br/>+ Power BI"]

        T1 --> T2 --> T3 --> T4 --> T5
    end

    POC --> ARROW --> TARGET

    style POC fill:#d1fae5,stroke:#059669,color:#064e3b
    style ARROW fill:#fef3c7,stroke:#d97706,color:#78350f
    style TARGET fill:#e0f2fe,stroke:#0284c7,color:#0c4a6e
```

| Composant | POC actuel | Architecture cible | Changement |
|-----------|-----------|-------------------|------------|
| **Sources de données** | Upload manuel de PDF/photos | SAP, SharePoint, GED, APIs on-premise, bases legacy | Multi-canal automatisé |
| **Stockage** | Azure Blob Storage | OneLake (Fabric) + Blob | Lac unifié gouverné |
| **Recherche polices** | PostgreSQL + pgvector | Azure AI Search + Foundry IQ | Scalable + managed |
| **Orchestration agents** | FastAPI custom Python | Foundry Agent Service (Workflow Agents) | Managed + observable |
| **Modèle IA** | Azure OpenAI (direct) | Foundry Model Catalog (même modèles) | Versioning + guardrails |
| **Connecteurs métier** | Aucun | Data Factory (batch) + MCP Servers (temps réel) | Intégration SI complète |
| **Gouvernance** | API Key manuelle | Entra ID + Purview + RBAC | Enterprise-grade |
| **Livraison** | Dashboard Next.js | Dashboard + Teams + Power BI | Multi-canal |
| **Observabilité** | Logs applicatifs | Application Insights + Agent Tracing | Bout en bout |

---

## 8. Séquence cible — Traitement d'un sinistre auto

Ce diagramme montre le déroulement complet dans l'architecture cible, avec les sources multi-canaux et les outils Foundry.

```mermaid
sequenceDiagram
    actor G as 👤 Gestionnaire
    participant TEAMS as 📱 Teams
    participant ORCH as ⚙️ Workflow Agent
    participant DA as 🗂️ Agent Données
    participant FIQ as 🟦 FabricIQ
    participant AR as 🧠 Agent Risque
    participant AP as 📚 Agent Police
    participant MCP as 🔌 MCP Server

    G->>TEAMS: Nouveau sinistre auto<br/>(constat + photos)
    TEAMS->>ORCH: Déclenchement workflow

    rect rgb(224, 242, 254)
        Note over DA: Phase 1 — Collecte multi-sources
        ORCH->>DA: Traiter les pièces jointes
        DA->>DA: Document Intelligence<br/>extraction des champs
        ORCH->>FIQ: Récupérer historique client
        FIQ-->>ORCH: Contrats SAP + sinistres passés
        ORCH->>MCP: Statut dossier en cours ?
        MCP-->>ORCH: Données SI métier
    end

    rect rgb(254, 243, 199)
        Note over AR: Phase 2 — Analyse enrichie
        ORCH->>AR: Dossier complet enrichi
        AR->>AR: Évaluation dommages<br/>(photos multimodales)
        AR->>AR: Analyse responsabilité<br/>+ détection fraude
        AR->>AR: Croisement historique<br/>(Client 360)
        AR-->>ORCH: Évaluation + signalements
    end

    rect rgb(209, 250, 229)
        Note over AP: Phase 3 — Conformité
        ORCH->>AP: Recherche AI Search<br/>+ SharePoint
        AP->>AP: Conditions Générales Auto<br/>articles applicables
        AP-->>ORCH: Citations + couverture
    end

    ORCH-->>TEAMS: Résultat dans Teams<br/>avec décision documentée
    ORCH-->>G: Notification + dashboard
```

---

## 9. Matrice de faisabilité — Vérification technique

Chaque intégration est classée selon son **statut réel** dans l'écosystème Microsoft (avril 2026).

| Intégration | Statut Microsoft | Complexité | Pré-requis |
|-------------|-----------------|------------|------------|
| **SharePoint → Foundry Agent** | ✅ Preview (built-in tool) | Faible | Licence M365 Copilot, Entra ID |
| **Azure AI Search → Foundry Agent** | ✅ GA (built-in tool) | Faible | Resource AI Search déployée |
| **Foundry IQ (knowledge retrieval)** | ✅ GA | Faible | Foundry project configuré |
| **Fabric Data Factory → SAP HANA** | ✅ GA (connector) | Moyenne | Data Gateway on-premise installée |
| **Fabric Data Factory → SAP BW** | ✅ GA (connector) | Moyenne | Data Gateway + config SAP |
| **Fabric Data Factory → SAP Table** | ✅ GA (connector) | Moyenne | Avec ou sans gateway |
| **SAP CDC (delta incrémental)** | ✅ GA (via ADF) | Élevée | ODP Framework SAP, licence SAP |
| **Fabric Data Factory → Oracle/SQL** | ✅ GA (connector) | Faible | Data Gateway on-premise |
| **Fabric IQ (ontologie, data agents)** | 🟡 Preview | Moyenne | Fabric capacity, IQ workload activé |
| **Fabric Data Agent → Foundry** | 🟡 Preview | Moyenne | Fabric + Foundry liés |
| **MCP Server custom (APIs on-premise)** | 🟡 Preview | Élevée | Développement MCP custom + APIM |
| **Workflow Agents (multi-agents)** | 🟡 Preview | Moyenne | Foundry Agent Service |
| **Hosted Agents (containers custom)** | 🟡 Preview | Élevée | Container Registry + code agent |
| **OneLake Shortcuts (cross-cloud)** | ✅ GA | Faible | Comptes ADLS, S3 ou GCS |
| **Publication dans Teams** | ✅ GA | Faible | Entra Agent Registry |
| **Power BI sur OneLake** | ✅ GA | Faible | Fabric capacity |

**Légende** : ✅ GA = Disponible en production | 🟡 Preview = Utilisable mais non garanti SLA

---

## 10. Chaîne de valeur — ROI de l'architecture cible

```mermaid
graph LR
    subgraph AUJOURD_HUI["❌ Processus actuel"]
        direction TB
        A1["Données cloisonnées<br/><i>SAP ≠ GED ≠ SharePoint</i>"]
        A2["Saisie manuelle<br/><i>Re-keying entre systèmes</i>"]
        A3["45 min / dossier<br/><i>Consultation de 5 systèmes</i>"]
        A4["Pas de vue 360<br/><i>Historique fragmenté</i>"]
    end

    subgraph DEMAIN["✅ Architecture cible"]
        direction TB
        D1["OneLake unifié<br/><i>Toutes les sources<br/>dans un lac gouverné</i>"]
        D2["Extraction IA<br/><i>Document Intelligence<br/>+ GPT-4.1</i>"]
        D3["8 min / dossier<br/><i>Agents autonomes<br/>+ validation humaine</i>"]
        D4["Client 360 complet<br/><i>SAP + GED + Sinistres<br/>+ Polices en un clic</i>"]
    end

    subgraph ROI["📈 Retour sur investissement"]
        direction TB
        R1["⏱️ <b>-82% temps</b><br/>de traitement"]
        R2["🔗 <b>100% sources</b><br/>connectées"]
        R3["🔍 <b>Traçabilité</b><br/>Purview + audit"]
        R4["📊 <b>Client 360</b><br/>vue unifiée<br/>cross-sell / upsell"]
        R5["🛡️ <b>Conformité</b><br/>RGPD, Solvabilité II"]
    end

    AUJOURD_HUI --> ROI
    DEMAIN --> ROI

    style AUJOURD_HUI fill:#fee2e2,stroke:#ef4444,color:#7f1d1d
    style DEMAIN fill:#d1fae5,stroke:#059669,color:#064e3b
    style ROI fill:#fef3c7,stroke:#d97706,color:#78350f
```

---

## Glossaire

| Terme | Définition |
|-------|-----------|
| **FabricIQ** | Plateforme de données Microsoft Fabric, incluant Data Factory (ingestion), OneLake (stockage unifié), et Fabric IQ (ontologie + data agents) |
| **FoundryIQ** | Plateforme d'agents IA Microsoft Foundry, incluant Agent Service (orchestration), Foundry IQ (knowledge retrieval) et le catalogue de modèles |
| **OneLake** | Lac de données unifié dans Fabric — toutes les données organisationnelles dans un seul endroit, format Delta Lake ouvert |
| **Data Gateway** | Passerelle logicielle installée dans le réseau Groupama pour connecter les systèmes on-premise au cloud de façon sécurisée |
| **Fabric IQ** | Workload Fabric (preview) : ontologie métier, data agents, semantic models, graphe de données |
| **Foundry IQ** | Système de knowledge retrieval de Foundry — RAG clé en main pour grounding des agents |
| **MCP Server** | Model Context Protocol — standard ouvert permettant aux agents Foundry d'appeler des APIs externes (on-premise, SaaS) |
| **APIM** | Azure API Management — passerelle d'APIs qui expose les services internes vers le cloud avec sécurité et monitoring |
| **OBO (On-Behalf-Of)** | Mécanisme d'authentification où l'agent agit avec l'identité de l'utilisateur final (pas un compte technique) |
| **SAP CDC** | SAP Change Data Capture — extraction incrémentale des modifications (deltas) depuis SAP via le framework ODP |
| **Agent Service** | Runtime managé de Foundry qui héberge, scale et sécurise les agents IA sans infrastructure à gérer |
| **RAG** | Retrieval-Augmented Generation — enrichir les réponses IA avec des documents réels (polices Groupama, historique sinistres) |
| **Workflow Agent** | Agent Foundry qui orchestre plusieurs agents en séquence avec branchements, approbations, et logique métier |
| **GDS / TDS / LTV** | Ratios financiers réglementaires pour l'éligibilité hypothécaire (Gross/Total Debt Service, Loan-to-Value) |
| **Purview** | Service de gouvernance Microsoft intégré à Fabric : classification, contrôle d'accès, audit, conformité RGPD |
