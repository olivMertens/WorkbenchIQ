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
