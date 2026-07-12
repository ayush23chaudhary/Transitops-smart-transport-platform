# TransitOps — Smart Transport Operations Platform

TransitOps is a smart logistics and dispatch management platform built for logistics companies to plan, schedule, dispatch, and track cargo trips while managing fleet vehicles, workforce rosters, maintenance schedules, and operational expenses.

This repository serves as the **Canonical Source of Truth** and base workspace setup for our 4-person development team.

---

## Technical Stack
- **Frontend**: React, Vite, Tailwind CSS, TypeScript, React Router, TanStack Query, React Hook Form, Zod, Recharts, Lucide React, Sonner (Toasts).
- **Backend**: Node.js, Express, TypeScript, Zod, JWT Authentication.
- **Database**: PostgreSQL, Prisma ORM.

---

## Directory Structure
Refer to [ARCHITECTURE.md](file:///Users/ayushchaudhary/Projects/TransitOps/docs/ARCHITECTURE.md) for a comprehensive description of the modular layout.

```
├── docs/                      # Architectural & design documentation
├── prisma/                    # Relational database schema
├── backend/                   # Node.js + Express backend service
└── frontend/                  # React + Vite frontend application
```

---

## Team Ownership Matrix
Detailed responsibilities are documented in [DATA_OWNERSHIP.md](file:///Users/ayushchaudhary/Projects/TransitOps/docs/DATA_OWNERSHIP.md):
- **Team Lead (Dev 1)**: Base architecture, database design, integration boundaries, and the **Trips & Dispatch** module.
- **Fleet Developer (Dev 2)**: Vehicles, Fleet metrics, and Maintenance logs.
- **Workforce Developer (Dev 3)**: User accounts, JWT auth middleware, RBAC permissions, and Driver roster.
- **Intelligence Developer (Dev 4)**: Fuel consumption, Expenses logging, Dashboard charts, and Analytics.

---

## Local Setup & Run Commands

### 1. Database Setup
Ensure you have a running PostgreSQL database. Create a database called `transitops`.

Set your `DATABASE_URL` environment variable inside `backend/.env`:
```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/transitops?schema=public"
```

Run migrations to create the tables:
```bash
cd backend
npx prisma migrate dev --name init --schema=../prisma/schema.prisma
```

Generate the Prisma client:
```bash
npx prisma generate --schema=../prisma/schema.prisma
```

Seed the database with test operational data:
```bash
npx prisma db seed
```

### 2. Run Backend Service
From the `backend` folder:
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
The server will run on [http://localhost:5000](http://localhost:5000).

### 3. Run Frontend Web App
From the `frontend` folder:
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev

# Build client-side assets
npm run build
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Development & Commit Conventions
Refer to [TEAM_CONTRACT.md](file:///Users/ayushchaudhary/Projects/TransitOps/docs/TEAM_CONTRACT.md) for branch strategy and conventional commit messaging formats.
- **Feature Branches**:
  - `feature/trips-dispatch`
  - `feature/fleet-maintenance`
  - `feature/auth-drivers`
  - `feature/analytics-finance`
- **Commit Format**: `feat(<module>): <description>` or `fix(<module>): <description>`.
