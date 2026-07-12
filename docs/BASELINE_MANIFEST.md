# Baseline Manifest

This manifest documents the state of the base repository following the initial implementation pass.

## 1. Project Architecture & Folders
- **Backend (Express + TS)**: `backend/`
  - Routes, controller, validation, types, and services organized inside modular domain directories under `backend/src/modules/`.
- **Frontend (React + Vite + TS + Tailwind v4)**: `frontend/`
  - Reusable layout components under `frontend/src/components/layout/`.
  - Reusable primitive components under `frontend/src/components/ui/`.
  - Feature-specific UI code organized under `frontend/src/features/`.
- **Prisma Database Layer**: `prisma/`
  - Canonical Prisma schema defining the database entities.

## 2. Database Schema Summary
- **Entities**: `User`, `Vehicle`, `Driver`, `Trip`, `MaintenanceRecord`, `FuelLog`, `Expense`.
- **Enums**: `UserRole`, `VehicleStatus`, `DriverStatus`, `TripStatus`, `MaintenanceStatus`, `ExpenseCategory`.
- **Indexes**: Applied to foreign keys, search strings (registration, license, trip numbers), and dates (scheduledAt, recordedAt).

## 3. Mounted API Route Groups
- `GET /api/health` - App health status
- `/api/auth` - Login credentials
- `/api/trips` - Trip lifecycle dispatches (DRAFT, DISPATCHED, COMPLETED, CANCELLED)
- `/api/vehicles` - List active vehicles
- `/api/drivers` - List active drivers
- `/api/maintenance` - List maintenance logs
- `/api/finance` - List fuel and expense records
- `/api/analytics` - Summary counters for the overview dashboard

## 4. Protected Shared Files
The following files are shared across features and must not be unilaterally changed or refactored:
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
- `frontend/tailwind.config.js`
