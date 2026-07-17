# Aawiz

Human intelligence system for continuous workplace wellbeing insight.

## Structure

```
apps/
├── api/           # FastAPI backend (Python)
├── dashboard/     # Organization dashboard (Next.js)
├── admin/         # Super admin panel (Next.js)
packages/
└── shared/        # Shared constants and types
```

## Quick start

```bash
# Backend
cd apps/api
pip install -r requirements.txt
uvicorn app.main:app --reload

# Org Dashboard
cd apps/dashboard
npm install && npm run dev

# Admin Dashboard
cd apps/admin
npm install && npm run dev
```
