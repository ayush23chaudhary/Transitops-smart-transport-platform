# TransitOps

### Smart Transport Operations Platform

TransitOps is a full-stack transport operations platform designed to unify **fleet management, driver safety, trip dispatch, maintenance, financial operations, and analytics** into a single operational system.

Rather than treating vehicles, drivers, trips, and maintenance as disconnected records, TransitOps models them as parts of one coordinated workflow where every operational decision affects the availability and state of the resources involved.

> **One platform. One operational truth. Every journey under control.**

---

## Live Application

**Production Deployment:**  
https://transitops-smart-transport-platform.vercel.app/

**Interactive Database Schema:**  
https://drawsql.app/draw?t=1469f0af-f4eb-41fa-bd05-750d138e1fee&view=1

---

## The Problem

Transport operations are highly interconnected, but the systems used to manage them are often fragmented.

A dispatcher may assign a vehicle without knowing that it has entered maintenance. A driver may appear available even though their license has expired. A vehicle may be assigned to multiple active operations because availability is tracked manually. Fuel, maintenance, and operating expenses may exist in separate systems, making it difficult to understand the true cost of fleet operations.

These are not simply data-management problems.

They are **state-consistency problems**.

A transport operation needs to answer, at any moment:

- Which vehicles are operational?
- Which drivers are legally and operationally eligible?
- Which resources can be dispatched right now?
- Why is a resource unavailable?
- What changes when a trip begins?
- What happens to availability when maintenance starts?
- Where are operational costs accumulating?
- Is the organization working from one consistent version of reality?

TransitOps was built around these questions.

---

## The Solution

TransitOps provides a unified operational control layer for transport organizations.

The platform connects:

- Vehicle Registry
- Driver & Safety Management
- Trip Planning and Dispatch
- Maintenance Operations
- Fuel and Expense Tracking
- Fleet Analytics
- Authentication
- Role-Based Access Control

The key principle is simple:

> **Operational modules should not exist in isolation.**

When a trip is dispatched:

```text
Trip    → DISPATCHED
Vehicle → ON_TRIP
Driver  → ON_TRIP
```

When the trip is completed:

```text
Trip    → COMPLETED
Vehicle → AVAILABLE
Driver  → AVAILABLE
```

When maintenance begins:

```text
Maintenance → IN_PROGRESS
Vehicle     → IN_SHOP
```

The vehicle is then automatically excluded from dispatch eligibility.

This connected state model helps prevent conflicting assignments and keeps operational data consistent across the platform.

---

# Core Capabilities

## Operations Overview

The TransitOps dashboard provides a centralized view of current fleet operations.

It surfaces key operational information such as:

- Active vehicles
- Available vehicles
- Vehicles under maintenance
- Active trips
- Pending trips
- Driver availability
- Fleet utilization
- Recent operational activity

The dashboard is designed as an **operations overview**, allowing users to understand the current state of the fleet quickly.

---

## Vehicle Registry

The Vehicle Registry acts as the operational source of truth for fleet assets.

### Capabilities

- Register vehicles
- Update vehicle information
- Search and filter the fleet
- Track operational status
- Monitor capacity
- Track odometer information
- Record acquisition information
- Determine dispatch eligibility

### Vehicle States

```text
AVAILABLE
ON_TRIP
IN_SHOP
RETIRED
```

Only operationally eligible vehicles can enter the dispatch pool.

A vehicle that is:

- already assigned to an active trip
- currently under maintenance
- retired
- unable to carry the required cargo

is prevented from being used for an invalid dispatch.

---

## Driver & Safety Management

TransitOps combines workforce availability with safety eligibility.

### Capabilities

- Driver registry
- Driver profile management
- License tracking
- License expiry validation
- Safety score visibility
- Operational status management
- Trip performance visibility
- Dispatch eligibility checks

### Driver States

```text
AVAILABLE
ON_TRIP
OFF_DUTY
SUSPENDED
```

A driver may exist in the system but still be ineligible for dispatch.

For example:

```text
Driver Status: AVAILABLE
License Status: EXPIRED
Dispatch Eligibility: BLOCKED
```

TransitOps separates **resource existence** from **resource eligibility**.

---

## Trip Dispatcher

The Trip Dispatcher is the central operational workflow of TransitOps.

A dispatcher can:

1. Create a trip
2. Define the source and destination
3. Enter cargo requirements
4. Enter planned distance
5. Select an eligible vehicle
6. Select an eligible driver
7. Validate operational constraints
8. Dispatch the trip
9. Monitor the active trip
10. Complete or cancel the trip according to valid lifecycle rules

### Dispatch Validation

Before a trip can be dispatched, TransitOps validates the assigned resources.

### Vehicle Validation

The vehicle must:

- be available
- not be under maintenance
- not be retired
- not already belong to another active trip
- have sufficient cargo capacity

### Driver Validation

The driver must:

- be available
- not already be on a trip
- not be off duty
- not be suspended
- have a valid license
- not belong to another conflicting active trip

### Capacity Protection

For example:

```text
Vehicle Capacity: 500 kg
Cargo Weight:     700 kg

Result:
DISPATCH BLOCKED

Reason:
Vehicle capacity exceeded by 200 kg
```

The interface communicates why an operation is blocked, while the backend remains the authoritative enforcement layer.

---

## Trip Lifecycle

TransitOps models trips as controlled state transitions.

```text
DRAFT
  │
  ▼
DISPATCHED
  │
  ├──────────► CANCELLED
  │
  ▼
COMPLETED
```

Invalid lifecycle transitions are rejected.

The Trip module coordinates the operational state of:

- Trip
- Vehicle
- Driver

This prevents different modules from maintaining conflicting versions of resource availability.

---

## Maintenance Management

The Maintenance module connects vehicle servicing directly with operational availability.

### Capabilities

- Create maintenance records
- Schedule maintenance
- Start maintenance
- Track active maintenance
- Complete maintenance
- View service history
- Filter maintenance records

### Maintenance Lifecycle

```text
SCHEDULED
    │
    ▼
IN_PROGRESS
    │
    ▼
COMPLETED
```

When maintenance starts:

```text
Maintenance → IN_PROGRESS
Vehicle     → IN_SHOP
```

The vehicle becomes unavailable for dispatch.

When maintenance is safely completed:

```text
Maintenance → COMPLETED
Vehicle     → AVAILABLE
```

This prevents a vehicle from being simultaneously considered both operational and under maintenance.

---

## Fuel & Expense Management

TransitOps provides financial visibility into day-to-day fleet operations.

The module is designed to manage operational records such as:

- Fuel logs
- Fuel expenditure
- Vehicle-related expenses
- Maintenance-related costs
- Other supported operational expenses

This financial data can then contribute to fleet-level operational analysis.

---

## Analytics

TransitOps converts operational data into decision-support metrics.

Depending on the available operational data, analytics can include:

- Fleet utilization
- Fuel efficiency
- Operational cost
- Cost breakdown
- Vehicle-level cost analysis
- Costliest vehicles
- Performance trends
- ROI where sufficient financial data exists

All analytics are intended to be derived from persisted operational data rather than hardcoded dashboard values.

---

## Authentication & Role-Based Access Control

TransitOps includes authentication and backend-enforced role-based access control.

The platform is designed around operational personas such as:

- Fleet Manager
- Dispatcher
- Safety Officer
- Financial Analyst

Authorization is enforced by the backend.

Frontend navigation visibility is treated as a user-experience layer, not as the security boundary.

```text
Request
   │
   ▼
Authentication
   │
   ▼
Identity Resolution
   │
   ▼
Role Validation
   │
   ├── Unauthorized → 401
   │
   ├── Forbidden    → 403
   │
   ▼
Authorized Operation
```

---

# The Connected Operational Model

The main strength of TransitOps is the relationship between its modules.

```text
                     ┌─────────────────┐
                     │   AUTH & RBAC   │
                     └────────┬────────┘
                              │
                              ▼
┌─────────────┐      ┌─────────────────┐      ┌─────────────┐
│   VEHICLES  │◄────►│  TRIP DISPATCH  │◄────►│   DRIVERS   │
└──────┬──────┘      └────────┬────────┘      └─────────────┘
       │                      │
       ▼                      ▼
┌─────────────┐      ┌─────────────────┐
│ MAINTENANCE │      │ FUEL & EXPENSES │
└──────┬──────┘      └────────┬────────┘
       │                      │
       └──────────┬───────────┘
                  ▼
          ┌───────────────┐
          │   ANALYTICS   │
          └───────────────┘
```

Examples of cross-module behavior:

```text
Maintenance starts
        ↓
Vehicle becomes IN_SHOP
        ↓
Vehicle disappears from dispatch eligibility
```

```text
Trip is dispatched
        ↓
Vehicle becomes ON_TRIP
        +
Driver becomes ON_TRIP
        ↓
Both resources are protected from conflicting assignment
```

```text
Trip is completed
        ↓
Vehicle and Driver are released
        ↓
Resources become operationally available again
```

---

# System Architecture

TransitOps follows a modular full-stack architecture.

```text
┌───────────────────────────────────────────────┐
│                  FRONTEND                     │
│                                               │
│  React + TypeScript + Vite                    │
│                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Dashboard │ │ Dispatch │ │ Fleet Modules│  │
│  └──────────┘ └──────────┘ └──────────────┘  │
└───────────────────────┬───────────────────────┘
                        │
                        │ REST API
                        ▼
┌───────────────────────────────────────────────┐
│                   BACKEND                     │
│                                               │
│  Node.js + Express + TypeScript               │
│                                               │
│  ┌─────────┐ ┌────────┐ ┌─────────────────┐  │
│  │  Auth   │ │ Trips  │ │ Fleet Operations│  │
│  └─────────┘ └────────┘ └─────────────────┘  │
│                                               │
│  ┌─────────────┐ ┌─────────┐ ┌────────────┐  │
│  │ Maintenance │ │ Finance │ │ Analytics  │  │
│  └─────────────┘ └─────────┘ └────────────┘  │
└───────────────────────┬───────────────────────┘
                        │
                        │ Prisma ORM
                        ▼
┌───────────────────────────────────────────────┐
│                 POSTGRESQL                    │
│                                               │
│      Relational Operational Data Model        │
└───────────────────────────────────────────────┘
```

---

# Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Reusable component architecture
- Responsive operational interface

## Backend

- Node.js
- Express.js
- TypeScript
- REST APIs
- Zod-based validation
- JWT authentication
- Role-Based Access Control

## Database

- PostgreSQL
- Prisma ORM
- Relational data modeling
- Database migrations
- Transactional operational workflows

## Deployment

- Vercel
- Environment-based configuration
- Production frontend deployment

---

# Database Design

The database is designed around the relationships between operational entities rather than treating each module as an isolated dataset.

Core entities include concepts such as:

```text
User
Vehicle
Driver
Trip
Maintenance
Fuel Log
Expense
```

The schema captures relationships required for:

- Resource assignment
- Trip lifecycle management
- Vehicle availability
- Driver availability
- Maintenance operations
- Financial records
- Analytics

### Interactive Schema Visualizer

Explore the complete relational model:

https://drawsql.app/draw?t=1469f0af-f4eb-41fa-bd05-750d138e1fee&view=1

---

# Project Structure

```text
TransitOps/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── layout/
│       │   └── ui/
│       │
│       ├── features/
│       │   ├── analytics/
│       │   ├── auth/
│       │   ├── dashboard/
│       │   ├── drivers/
│       │   ├── finance/
│       │   ├── maintenance/
│       │   ├── trips/
│       │   └── vehicles/
│       │
│       ├── lib/
│       ├── App.tsx
│       └── main.tsx
│
├── backend/
│   ├── prisma/
│   │   └── seed.ts
│   │
│   └── src/
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── analytics/
│       │   ├── auth/
│       │   ├── drivers/
│       │   ├── finance/
│       │   ├── maintenance/
│       │   ├── trips/
│       │   └── vehicles/
│       │
│       ├── app.ts
│       └── server.ts
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
└── docs/
    ├── ANALYTICS_DEFINITIONS.md
    ├── API_CONTRACT.md
    ├── ARCHITECTURE.md
    ├── BUSINESS_RULES.md
    ├── DATABASE_DESIGN.md
    ├── DEMO_FLOW.md
    ├── ER_DIAGRAM.md
    ├── INTEGRATION_CONTRACTS.md
    ├── MODULE_OWNERSHIP.md
    ├── RBAC_MATRIX.md
    └── TEAM_CONTRACT.md
```

---

# Getting Started

## Prerequisites

Ensure the following are installed:

```text
Node.js
npm
PostgreSQL
Git
```

---

## 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd TransitOps
```

---

## 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

## 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

---

## 4. Configure Environment Variables

Create the required environment files using the provided examples.

### Backend

```bash
cd backend
cp .env.example .env
```

Configure the required values according to the existing `.env.example`.

Typical backend configuration may include:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secure-secret"
PORT=5000
```

Never commit production secrets.

### Frontend

```bash
cd frontend
cp .env.example .env
```

Configure the backend API URL using the environment variable defined by the project.

Example:

```env
VITE_API_URL=http://localhost:5000
```

Use the exact variable names defined in the repository's `.env.example` files.

---

## 5. Generate Prisma Client

The project uses the root Prisma schema as the database source of truth.

From the repository root:

```bash
npx prisma generate --schema=./prisma/schema.prisma
```

Or, when running from the backend directory:

```bash
npx prisma generate --schema=../prisma/schema.prisma
```

---

## 6. Apply Database Migrations

Use the existing migration history.

From the repository root:

```bash
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

For local development, follow the migration workflow already established by the project.

Do not create a new migration unless the database schema is intentionally being changed.

---

## 7. Seed Demo Data

Run the existing seed workflow according to the scripts configured in the repository.

For example:

```bash
cd backend
npm run seed
```

Check `backend/package.json` for the exact available command.

---

## 8. Start the Backend

```bash
cd backend
npm run dev
```

---

## 9. Start the Frontend

Open another terminal:

```bash
cd frontend
npm run dev
```

The application should now be available at the local URL printed by Vite.

---

# Environment Configuration

The application requires environment-specific configuration.

Never commit:

```text
.env
.env.local
production secrets
database credentials
JWT secrets
```

Use:

```text
.env.example
```

to document required variables without exposing sensitive values.

---

# API Architecture

The backend is organized by business domain.

```text
/api/auth
/api/vehicles
/api/drivers
/api/trips
/api/maintenance
/api/finance
/api/analytics
```

Each module is responsible for its own domain logic while following shared:

- API conventions
- authentication
- authorization
- validation
- database access patterns
- error handling

For detailed endpoint contracts, see:

```text
docs/API_CONTRACT.md
```

---

# Business Rules

TransitOps enforces operational rules on the backend.

Examples include:

### A vehicle cannot be dispatched when:

```text
Status = ON_TRIP
Status = IN_SHOP
Status = RETIRED
Capacity < Cargo Weight
Conflicting active trip exists
```

### A driver cannot be dispatched when:

```text
Status = ON_TRIP
Status = OFF_DUTY
Status = SUSPENDED
License = EXPIRED
Conflicting active trip exists
```

### A vehicle entering maintenance:

```text
AVAILABLE
    ↓
Maintenance starts
    ↓
IN_SHOP
    ↓
Removed from dispatch eligibility
```

These constraints are not treated as frontend-only checks.

The backend remains the authoritative enforcement layer.

For detailed rules, see:

```text
docs/BUSINESS_RULES.md
```

---

# Data Consistency

TransitOps is designed to protect cross-entity state consistency.

Critical workflows may update multiple entities as one logical operation.

For example, dispatching a trip requires coordinated state changes:

```text
Trip
Vehicle
Driver
```

A partial update could leave the system in an invalid state.

The architecture therefore treats multi-entity operational transitions as atomic workflows where required.

This helps prevent states such as:

```text
Trip = DISPATCHED
Vehicle = AVAILABLE
Driver = AVAILABLE
```

when all three should represent the same active operation.

---

# Demo Flow

A recommended demonstration sequence:

```text
1. Log in
        ↓
2. View Operations Overview
        ↓
3. Inspect Vehicle Registry
        ↓
4. Inspect Driver Eligibility
        ↓
5. Create a Draft Trip
        ↓
6. Attempt an Invalid Assignment
        ↓
7. Observe the Blocking Reason
        ↓
8. Select Eligible Resources
        ↓
9. Dispatch the Trip
        ↓
10. Vehicle → ON_TRIP
        ↓
11. Driver → ON_TRIP
        ↓
12. Complete the Trip
        ↓
13. Resources Become Available
        ↓
14. Start Vehicle Maintenance
        ↓
15. Vehicle → IN_SHOP
        ↓
16. Vehicle Removed from Dispatch Eligibility
```

This demonstrates the core idea behind TransitOps:

> **Every operational action has a system-wide consequence.**

---

# Engineering Principles

TransitOps was developed around several engineering principles.

## Backend Authority

Critical business rules are enforced on the backend.

The frontend improves usability but is not treated as the security or validation boundary.

## Single Source of Truth

The PostgreSQL database and Prisma schema define the persistent operational model.

## Domain Ownership

The application is organized around business domains rather than one monolithic application layer.

## Explicit State Transitions

Operational state changes are validated rather than allowing arbitrary status updates.

## Cross-Module Consistency

Vehicle, Driver, Trip, and Maintenance states are treated as connected operational data.

## No Fabricated Analytics

Metrics should be calculated from real persisted data.

## Explain Blocked Operations

When an operation cannot proceed, the interface should communicate why whenever that information is available.

---

# Documentation

The repository contains dedicated technical and operational documentation.

| Document | Purpose |
|---|---|
| `ARCHITECTURE.md` | System architecture |
| `API_CONTRACT.md` | API conventions and contracts |
| `BUSINESS_RULES.md` | Operational business rules |
| `DATABASE_DESIGN.md` | Database architecture |
| `ER_DIAGRAM.md` | Entity relationship documentation |
| `INTEGRATION_CONTRACTS.md` | Cross-module integration rules |
| `ANALYTICS_DEFINITIONS.md` | Metric definitions |
| `RBAC_MATRIX.md` | Role and permission model |
| `MODULE_OWNERSHIP.md` | Development ownership boundaries |
| `TEAM_CONTRACT.md` | Team collaboration conventions |
| `DEMO_FLOW.md` | Recommended evaluator demonstration |

---

# Team Development Model

TransitOps was developed using parallel domain ownership.

The project was divided into independent modules to reduce merge conflicts and preserve clear responsibilities.

```text
Shared Foundation
        │
        ├── Fleet & Maintenance
        │
        ├── Authentication & Drivers
        │
        ├── Trips & Integration
        │
        └── Finance & Analytics
```

Feature branches were integrated through Pull Requests into the main branch.

This approach allowed the team to work independently while maintaining shared:

- Database contracts
- API conventions
- Business rules
- Integration contracts
- UI patterns

---

# Production

### Live Application

https://transitops-smart-transport-platform.vercel.app/

The frontend is deployed as a production web application.

Deployment configuration should use environment variables for external services and backend API connectivity.

---

# Database Schema

The complete database model can be explored visually using the interactive schema:

https://drawsql.app/draw?t=1469f0af-f4eb-41fa-bd05-750d138e1fee&view=1

The schema demonstrates how operational entities are connected across:

```text
Authentication
Fleet
Drivers
Trips
Maintenance
Finance
Analytics
```

---

# Future Scope

Potential future extensions include:

- Real-time GPS vehicle tracking
- Route optimization
- Predictive maintenance
- Automated maintenance scheduling
- Geofencing
- Driver behavior telemetry
- Advanced cost forecasting
- Fleet demand forecasting
- Notification workflows
- Audit logging
- External telematics integration
- Mobile driver application
- Multi-depot operations

These are future extensions and are not presented as currently implemented functionality.

---

# Why TransitOps?

Most transport software can store records.

TransitOps focuses on the harder problem:

> **Keeping the entire operation consistent when those records change.**

A vehicle entering maintenance should affect dispatch.

A driver safety issue should affect eligibility.

A trip beginning should affect resource availability.

A trip ending should release those resources safely.

Operational costs should contribute to measurable insight.

TransitOps brings these relationships together into one connected system.

---

<div align="center">

## TransitOps

### One Platform. One Operational Truth. Every Journey Under Control.

**Live Application**  
https://transitops-smart-transport-platform.vercel.app/

**Database Schema**  
https://drawsql.app/draw?t=1469f0af-f4eb-41fa-bd05-750d138e1fee&view=1

</div>
