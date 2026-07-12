# Data Ownership Matrix

This document defines the clear modular boundaries and ownership details for the TransitOps development team.

| Module | Owned Entities | Backend Scope | Frontend Scope | Primary Owner |
| :--- | :--- | :--- | :--- | :--- |
| **Trips & Dispatch** | Trip | `backend/src/modules/trips/**` | `frontend/src/features/trips/**` | **Team Lead (Dev 1)** |
| **Fleet** | Vehicle, MaintenanceRecord | `backend/src/modules/vehicles/**`<br>`backend/src/modules/maintenance/**` | `frontend/src/features/vehicles/**`<br>`frontend/src/features/maintenance/**` | **Developer 2** |
| **Workforce** | User, Driver | `backend/src/modules/auth/**`<br>`backend/src/modules/drivers/**` | `frontend/src/features/auth/**`<br>`frontend/src/features/drivers/**` | **Developer 3** |
| **Intelligence** | FuelLog, Expense | `backend/src/modules/finance/**`<br>`backend/src/modules/analytics/**` | `frontend/src/features/dashboard/**`<br>`frontend/src/features/finance/**`<br>`frontend/src/features/analytics/**` | **Developer 4** |

## Shared & Core File Governance

Only the **Team Lead** should approve changes to the following shared files to maintain stability and prevent conflicts:
- `prisma/schema.prisma`
- Root config files (`package.json`, `tsconfig.json`, `tailwind.config.js`, etc.)
- Shared components (`frontend/src/components/ui/**`, `frontend/src/components/layout/**`)
- Shared services/utilities (`frontend/src/lib/**`, `backend/src/shared/**`)
