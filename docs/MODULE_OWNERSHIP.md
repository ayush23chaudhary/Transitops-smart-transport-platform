# Module Ownership Manifest

This manifest maps file paths and modules to their primary owners to guarantee zero overlaps and resolve merge conflicts during parallel development.

## 1. Owner Matrix

### TEAM LEAD (Developer 1)
- **Primary Domain**: Trips, Cargo Dispatch, Core Integrations, Core Transactions.
- **Backend Directory**: `backend/src/modules/trips/**`
- **Frontend Directory**: `frontend/src/features/trips/**`

### FLEET DEVELOPER (Developer 2)
- **Primary Domain**: Vehicle Registry, Maintenance Record Management.
- **Backend Directories**:
  - `backend/src/modules/vehicles/**`
  - `backend/src/modules/maintenance/**`
- **Frontend Directories**:
  - `frontend/src/features/vehicles/**`
  - `frontend/src/features/maintenance/**`

### WORKFORCE DEVELOPER (Developer 3)
- **Primary Domain**: User accounts, Drivers profiles, Authentication, Authorization (RBAC).
- **Backend Directories**:
  - `backend/src/modules/auth/**`
  - `backend/src/modules/drivers/**`
- **Frontend Directories**:
  - `frontend/src/features/auth/**`
  - `frontend/src/features/drivers/**`

### OPERATIONS INTELLIGENCE DEVELOPER (Developer 4)
- **Primary Domain**: Financial tracking (Fuel, Expenses), Dashboard KPIs, Analytics, ROI metrics.
- **Backend Directories**:
  - `backend/src/modules/finance/**`
  - `backend/src/modules/analytics/**`
- **Frontend Directories**:
  - `frontend/src/features/dashboard/**`
  - `frontend/src/features/finance/**`
  - `frontend/src/features/analytics/**`

---

## 2. Shared / Protected Files
These files represent the core foundation. Changes to these paths require Team Lead approval:
- `prisma/schema.prisma`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/db.ts`
- `backend/src/middleware/auth.ts`
- `frontend/src/App.tsx`
- `frontend/src/main.tsx`
- `frontend/src/lib/api.ts`
- `frontend/src/components/ui/**`
- `frontend/src/components/layout/**`
