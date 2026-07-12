# Team Contract & Workflow Guidelines

This document outlines team agreements and repository boundaries to ensure smooth parallel development during this hackathon.

## Core Rules & File Boundaries

1. **Strict Ownership**: 
   - Developers must work inside their designated feature directories (both frontend and backend).
   - Do not modify another developer's business modules without direct coordination.
2. **Shared File Changes**:
   - Only the **Team Lead** should approve modifications to the following root configuration and schema files:
     - `prisma/schema.prisma`
     - Global dependencies (`package.json`)
     - Shared UI components (`frontend/src/components/ui/**`, `frontend/src/components/layout/**`)
     - Global configs (`tailwind.config.js`, `tsconfig.json`)
3. **No Redundant Formatting Commits**:
   - Do not run repository-wide auto-formatting before making commits. Only format files that you have modified to prevent merge conflicts.
4. **Use Centralized Services**:
   - Do not declare independent Axios/Fetch clients in feature directories. Use the shared fetch client located at `frontend/src/lib/api.ts`.
   - Use the centralized `StatusBadge.tsx` component to map enums to status colors.
5. **Database Updates**:
   - Do not independently rename database columns. If a schema change is required, open a request with the Team Lead.

## Branching & Commit Conventions

### Branches
- Team Lead: `feature/trips-dispatch`
- Fleet Developer: `feature/fleet-maintenance`
- Workforce Developer: `feature/auth-drivers`
- Intelligence Developer: `feature/analytics-finance`

### Commits
Follow the Angular Conventional Commits standard:
- `feat(trip): implement dispatch transaction`
- `feat(vehicle): add vehicle registration`
- `fix(trip): prevent duplicate active assignment`
- `docs: update integration contract`
