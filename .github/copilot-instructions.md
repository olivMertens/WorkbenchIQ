# GroupaIQ — Copilot Custom Instructions

## Project Overview
GroupaIQ is an AI-powered document processing workbench for Groupama insurance, built with FastAPI (Python 3.11) backend and Next.js 14 frontend. It supports 5 personas: Souscription, Sinistres Santé, Sinistres Auto, Souscription Hypothécaire, and Client 360.

## Tech Stack
- **Backend**: Python 3.11, FastAPI, uv (package manager), Gunicorn + Uvicorn workers
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, next-intl (French i18n)
- **Database**: PostgreSQL 16 + pgvector (RAG semantic search)
- **AI Services**: Azure OpenAI (GPT-4.1), Azure Document Intelligence (Content Understanding)
- **Storage**: Azure Blob Storage
- **Deployment**: Docker → Azure Container Registry → Azure Container Apps (France Central)
- **IaC**: Bicep (infra/main.bicep)

## Architecture

### Backend (root directory)
- `api_server.py` — FastAPI entry point
- `app/` — Application modules (config, auth, storage, processing, claims, rag, mortgage, multimodal)
- `app/claims/` — Claims processing engine (engine.py, api.py, policies.py, search.py)
- `app/rag/` — RAG pipeline (indexer.py, chunker.py, embeddings.py, search.py, repository.py)
- `app/storage_providers/` — Azure Blob or local file storage
- `prompts/` — Policy JSON files (automotive, life-health, mortgage, property-casualty)
- `scripts/` — CLI tools (index_pdf_policies.py, setup_postgresql_rag.py, etc.)

### Frontend (frontend/)
- `src/app/` — Next.js App Router pages (admin, customers, login)
- `src/components/` — 40+ React components (TopNav, Sidebar, LandingPage, claims/, mortgage/)
- `src/lib/` — Utilities (api.ts, personas.ts, PersonaContext.tsx, auth.ts, types.ts)
- `src/i18n/` — next-intl configuration (default locale: fr)
- `messages/` — Translation files (fr.json, en.json)

### Infrastructure (infra/)
- `main.bicep` — All Azure resources (ACR, ACA, Storage, PostgreSQL, Content Understanding)
- `main.bicepparam` — Parameter values (reuses existing OpenAI resource)
- `deploy.sh` — CLI deployment script

## Coding Conventions

### Python
- Line length: 100 (ruff + black)
- Target: Python 3.11
- Use `from __future__ import annotations` in all modules
- Logging via `app.utils.setup_logging()`
- Async database operations via `asyncpg`
- Dependency management via `uv` (pyproject.toml + uv.lock)

### TypeScript / React
- Next.js App Router with `'use client'` directives
- Tailwind CSS for styling (Groupama green `#006838` primary)
- `clsx` for conditional class names
- `lucide-react` for icons
- French as default locale via `next-intl` (`useTranslations()` hook)

### Branding
- App name: **GroupaIQ** (not WorkbenchIQ)
- Logo: `frontend/public/groupama-logo.png` (Groupama official mark)
- Primary color: `#006838` (dark Groupama green)
- Secondary: `#00a651`, Accent: `#004d2a`
- Default language: French (`<html lang="fr">`)
- All persona names in French (Souscription, Sinistres Auto, etc.)

## Docker & Deployment

### Build Images
```bash
# Backend (from repo root)
az acr build --registry acrgroupaiqprod --image groupaiq-api:<tag> --file Dockerfile .

# Frontend (from frontend/ context)
az acr build --registry acrgroupaiqprod --image groupaiq-frontend:<tag> --file Dockerfile frontend/
```

### .dockerignore Strategy
- Backend: excludes tests/, docs/, specs/, frontend/, assets/pdf/, .git/, scripts/ (except startup.sh)
- Frontend: excludes node_modules/, .next/, coverage/
- Critical for `az acr build` speed (uploads context to Azure)

### ACA Update
```bash
az containerapp update --name ca-api-prod --resource-group rg-groupaiq-prod --image <acr>/groupaiq-api:<tag>
az containerapp update --name ca-frontend-prod --resource-group rg-groupaiq-prod --image <acr>/groupaiq-frontend:<tag>
```

### Health Check
- API: `GET /` returns `{"status":"ok","name":"GroupaIQ","version":"0.3.0"}`
- Bypasses API key auth (middleware intercept)

## CI/CD Pipeline

### CI (ci.yml) — Runs on every push/PR
1. **Backend lint**: `ruff check` + `ruff format --check` + import verification
2. **Frontend lint**: TypeScript type check + Next.js lint + build
3. **Docker build check**: Verify both Dockerfiles build (no push)

### CD (deploy.yml) — Runs after CI passes on main
1. Detect changed paths (api vs frontend)
2. Build + push changed images to ACR
3. Update ACA container apps
4. Health check verification

### Required GitHub Secrets
- `AZURE_CLIENT_ID` — OIDC app registration
- `AZURE_TENANT_ID` — Azure AD tenant
- `AZURE_SUBSCRIPTION_ID` — Subscription ID
- `GROUPAIQ_API_KEY` — Backend API key

## RAG / Policy Search

### Indexing Groupama PDFs
```bash
python scripts/index_pdf_policies.py --force          # Uses Document Intelligence
python scripts/index_pdf_policies.py --local --force   # Uses PyMuPDF fallback
```

### 4 Policy Documents (assets/pdf/)
| File | Category | DB Category |
|------|----------|-------------|
| Conditions Gen Habitation | Property | property_casualty |
| Complémentaire Santé | Health | life_health |
| Conditions Gen Auto | Auto | automotive |
| Conditions Gen Flotte Auto | Fleet | automotive |

### Search Methods
- `semantic_search()` — Pure vector similarity
- `filtered_search()` — Vector + metadata filters (category, risk_level)
- `intelligent_search()` — LLM-inferred categories + vector
- `hybrid_search()` — pgvector + trigram text search

## Key Environment Variables
- `AZURE_OPENAI_ENDPOINT` — OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT_NAME` — e.g., gpt-4-1
- `AZURE_CONTENT_UNDERSTANDING_ENDPOINT` — Document Intelligence
- `STORAGE_BACKEND` — `azure_blob` or `local`
- `DATABASE_BACKEND` — `postgresql` or `json`
- `RAG_ENABLED` — `true` to enable policy search
- `API_KEY` — Backend auth key (min 32 chars)

## TSX / React Best Practices

### SOLID Principles
- **Single Responsibility (SRP)**: One component = one concern. A tab panel should be its own component, not 500 lines inside a parent. Extract `<AdminDocumentsTab>`, `<AdminPromptsTab>`, `<AdminAnalyzerTab>`, `<AdminPoliciesTab>` from monolithic pages.
- **Open/Closed (OCP)**: Extend via composition (render props, children, slots), not by adding more `if/else` branches to existing components. New persona → new overview component, not more conditionals in a shared one.
- **Liskov Substitution (LSP)**: Shared prop interfaces (e.g. `ClaimsOverviewProps`) must be interchangeable across `AutomotiveClaimsOverview`, `PropertyCasualtyClaimsOverview`, `LifeHealthClaimsOverview`.
- **Interface Segregation (ISP)**: Don't pass the entire application object when a component only needs `{ id, status }`. Keep prop types narrow.
- **Dependency Inversion (DIP)**: Components depend on abstractions (API hooks, context), not on `fetch()` calls embedded inline. Extract data-fetching into custom hooks (`useApplications`, `usePolicies`).

### YAGNI (You Aren't Gonna Need It)
- Don't add features, config options, or abstractions "for later". Build only what the current task requires.
- No speculative generalization: if only one persona uses a component, don't parameterize it for all five.
- Delete dead code paths — unused props, commented-out JSX, unreachable branches.

### DRY (Don't Repeat Yourself)
- Extract repeated API call patterns into shared hooks (e.g. `useFetch<T>(url)`).
- Shared form field patterns → reusable `<FormField label={t('key')} value={v} onChange={fn} />`.
- Policy editor forms (automotive, health, underwriting) share identical field layouts — use a data-driven renderer instead of duplicating JSX.
- Translation key patterns: use interpolation (`t('status', { name })`) over separate keys per variant.

### Avoid God Components
- **Rule**: No component file should exceed ~400 lines. Files above 600 lines must be refactored.
- **Current offenders**: `admin/page.tsx` (2392 lines), `LandingPage.tsx` (873), `LifeHealthClaimsOverview.tsx` (875), `GlossaryManager.tsx` (773).
- **Refactor pattern**: Extract each logical section (tab, panel, modal, form) into its own file under a co-located folder (e.g. `src/components/admin/DocumentsTab.tsx`).
- **State management**: Lift shared state into a context or custom hook (`useAdminState`), pass only what each child needs.

### Component Design Guidelines
- Prefer composition over inheritance — never use class components.
- Custom hooks for any logic reused across ≥2 components (`useToast`, `useApplications`, `usePolicyEditor`).
- Co-locate related files: `components/admin/DocumentsTab.tsx`, `components/admin/useAdminState.ts`, `components/admin/types.ts`.
- Keep JSX readable: extract complex conditions into named variables or helper functions before the return statement.
- All user-facing strings via `useTranslations()` — no hardcoded French or English in JSX.

## Demo Quality Standards

### Data Coherence
- Demo data must reflect realistic Groupama insurance scenarios: real French names, addresses, SIRET numbers, policy numbers matching Groupama formats.
- Use the 5 persona workflows with plausible documents: attestation d'assurance habitation, déclaration de sinistre auto with photos, bulletin d'adhésion santé, dossier hypothécaire with property valuation.
- Monetary values in EUR (€), dates in DD/MM/YYYY, phone numbers in +33 format.
- Policy references must match the indexed Groupama PDFs (Conditions Générales Habitation, Complémentaire Santé, Conditions Auto, Flotte Auto).

### Demo Flow — Fast & Coherent
- Each persona demo should complete in under 3 minutes: upload → extraction → AI analysis → result display.
- Pre-seed representative documents in Azure Blob so the demo starts with data already available (no waiting for uploads).
- Show the full AI pipeline: Document Intelligence extraction → GPT-4.1 analysis → RAG policy search → risk assessment, not just one step.
- Highlight what each AI agent does: Data Agent (extraction), Risk Agent (analysis), Policy Agent (RAG search).

### Personas Demo Scenarios
| Persona | Demo Scenario | Key Output |
|---------|--------------|------------|
| Souscription | Health underwriting: APS medical document → risk scoring | Risk rating, medical flags, policy recommendation |
| Sinistres Santé | Health claim: hospital invoice → coverage check | Reimbursement calculation, policy match, exclusions |
| Sinistres Auto | Auto claim: accident report + photos → damage assessment | Damage estimate, liability analysis, fraud indicators |
| Souscription Hypothécaire | Mortgage: property + borrower docs → eligibility | LTV ratio, debt-to-income, property valuation |
| Client 360 | Customer overview: aggregated view across all policies | Cross-sell opportunities, claim history, risk profile |

## Insurance Workflow Improvement

### How GroupaIQ Improves Claims Processing
The document processing workbench accelerates the end-to-end insurance claims workflow:

1. **FNOL (First Notice of Loss)** — High AI potential
   - Document Intelligence extracts structured data from déclarations de sinistre (scanned forms, photos)
   - GPT-4.1 validates data consistency, flags missing fields
   - RAG searches Conditions Générales to verify initial coverage
   - **Impact**: Automated data extraction replaces manual re-keying, reduces errors

2. **Claim Analysis** — High AI potential
   - Multi-modal analysis: text extraction + damage photo assessment (auto claims)
   - Risk Agent scores claim severity and estimates liability
   - Policy Agent cross-references coverage limits, deductibles, exclusions via RAG
   - **Impact**: Faster triage, consistent analysis, auditable AI reasoning with source citations

3. **Fraud Detection** — High AI potential
   - Anomaly detection via claim history patterns (Client 360 persona)
   - Cross-reference declared damages vs. photo evidence (auto multimodal)
   - Flag inconsistencies between declaration and extracted document data
   - **Impact**: Early fraud indicators surfaced during analysis, not after payment

4. **Underwriting Policy Adjustments** — High AI potential
   - RAG-powered policy search across all Groupama conditions générales
   - AI-suggested adjustments based on claims frequency and severity
   - Risk scoring models inform premium recalculation
   - **Impact**: Data-driven underwriting decisions, faster policy updates

5. **Financial Administration** — Medium AI potential
   - Structured extraction of monetary amounts, dates, policy numbers
   - Automated accuracy checks against policy terms
   - **Impact**: Reduced back-and-forth with policyholders, higher data accuracy

### Business Outcomes
- **Less back-and-forth**: AI extracts and validates data upfront, reducing information requests
- **Higher NPS/CSAT**: Faster claim resolution with transparent AI reasoning
- **Lower expense ratio**: Automated extraction and analysis reduce manual processing time
- **Higher productivity**: Agents focus on exceptions, not data entry
- **Higher data accuracy**: Document Intelligence + LLM validation catch errors early
- **Less fraud**: Multi-modal cross-referencing and anomaly detection at intake
