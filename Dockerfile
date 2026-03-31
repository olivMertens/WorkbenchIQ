# =============================================================================
# Backend Dockerfile — Multi-stage with uv for fast, lean builds
# Final image: python:3.11-slim (~300MB)
# =============================================================================

# Stage 1: Build dependencies with uv
FROM ghcr.io/astral-sh/uv:0.6-python3.11-bookworm-slim AS builder

WORKDIR /app

# Copy dependency files first for layer caching
COPY pyproject.toml uv.lock ./

# Install dependencies (no dev deps, no editable installs)
RUN uv sync --frozen --no-dev --no-editable

# Stage 2: Lean runtime image
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install only minimal runtime deps (no build tools)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy virtual environment from builder
COPY --from=builder /app/.venv /app/.venv

# Ensure venv is on PATH
ENV PATH="/app/.venv/bin:$PATH" \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Copy application code (only what's needed at runtime)
COPY api_server.py ./
COPY app/ ./app/
COPY prompts/ ./prompts/
COPY scripts/startup.sh ./scripts/startup.sh

# Make startup script executable
RUN chmod +x scripts/startup.sh

EXPOSE 8000

# Health check — no curl needed (uses Python stdlib)
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1

CMD ["/bin/bash", "scripts/startup.sh"]
