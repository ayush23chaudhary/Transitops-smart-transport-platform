# Project Architecture

This document describes the design patterns, architectural layers, and folder structure of **TransitOps — Smart Transport Operations Platform**.

## Modular Monolith Directory Structure

The repository is structured to allow four developers to work in parallel on isolated feature boundaries with minimal merge conflicts.

```
/
├── docs/                      # Architectural & design documentation
├── prisma/                    # Relational database schema
├── backend/                   # Node.js + Express + TypeScript service
│   ├── src/
│   │   ├── config/            # Database and global configurations
│   │   ├── middleware/        # Authentication & Role-based Access middlewares
│   │   ├── modules/           # Isolated business domain modules
│   │   │   ├── auth/          # Authentication & user sessions (Workforce)
│   │   │   ├── vehicles/      # Fleet vehicles (Fleet)
│   │   │   ├── drivers/       # Driver profiles (Workforce)
│   │   │   ├── trips/         # Dispatch lifecycle (Team Lead)
│   │   │   ├── maintenance/   # Vehicle maintenance (Fleet)
│   │   │   ├── finance/       # Fuel logs and expenses (Intelligence)
│   │   │   └── analytics/     # Dashboard and KPIs (Intelligence)
│   │   ├── app.ts             # Express application bootstrapping
│   │   └── server.ts          # Express listener entrypoint
│
└── frontend/                  # React + Vite + TypeScript web interface
    ├── src/
    │   ├── components/        # Reusable global layout and UI elements
    │   │   ├── layout/        # Collapsible Sidebar, Topbar, AppShell
    │   │   └── ui/            # Buttons, Inputs, Cards, StatusBadges
    │   ├── features/          # Modularized frontend feature layouts
    │   │   ├── auth/          # Login flow
    │   │   ├── dashboard/     # Operations overview dashboard
    │   │   ├── vehicles/      # Fleet vehicle screens
    │   │   ├── drivers/       # Workforce driver lists
    │   │   ├── trips/         # Trip schedule & dispatch console
    │   │   ├── maintenance/   # Maintenance logs views
    │   │   └── finance/       # Fuel refills and expenses tables
    │   ├── lib/               # Global utility services (API client)
    │   ├── App.tsx            # Protected client-side routing definitions
    │   ├── main.tsx           # React bootstrap entry point with TanStack Query
    │   └── index.css          # Main styling & Tailwind CSS directives
```

## Backend Architecture Pattern

Each business module is self-contained under `backend/src/modules/<module_name>/`. Within this directory, the module defines:
- **`*.routes.ts`**: Mounts Express endpoints and configures RBAC rules.
- **`*.controller.ts`**: Maps HTTP request parameters, validates input request bodies, and shapes the JSON response.
- **`*.service.ts`**: Performs atomic transactions, enforces database constraints, and computes domain invariants.
- **`*.validation.ts`**: Defines Zod validation schemas.
- **`*.types.ts`**: Defines TypeScript type extensions and DTO structures.

## Frontend Architecture Pattern

We use a modular layout corresponding directly with the backend structure:
- **Feature Folders (`frontend/src/features/`)**: Contain page layout components that correspond to backend endpoints.
- **API Client (`frontend/src/lib/api.ts`)**: Single global fetch wrapper that handles JWT injection and handles canonical API response formatting.
- **Centralized StatusBadge Mapping**: All statuses are fed through `StatusBadge.tsx` to maintain unified colors across the platform.
