# Role-Based Access Control (RBAC) Matrix

This matrix defines the roles and access levels enforced across endpoints and frontend views.

| Action / Endpoint | FLEET_MANAGER | DISPATCHER | SAFETY_OFFICER | FINANCIAL_ANALYST |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Trips** (Create/Dispatch/Complete/Cancel) | Yes | Yes | No | No |
| **View Trips** | Yes | Yes | Yes | Yes |
| **Manage Vehicles** (CRUD) | Yes | No | No | No |
| **View Vehicles** | Yes | Yes | Yes | Yes |
| **Manage Drivers** (CRUD/Scores) | No | No | Yes | No |
| **View Drivers** | Yes | Yes | Yes | Yes |
| **Manage Maintenance** (Schedule/Workshop) | Yes | No | No | No |
| **View Maintenance** | Yes | Yes | No | Yes |
| **Manage Fuel & Expenses** | No | No | No | Yes |
| **View Fuel & Expenses** | Yes | No | No | Yes |
| **View Analytics & Reports** | Yes | Yes | Yes | Yes |
| **Edit Depot Settings** | Yes | No | No | No |

## Role Definitions

### 1. FLEET_MANAGER
Responsible for physical asset health, procurement, and maintenance scheduling.
- **Scope**: Vehicles, MaintenanceRecords, Settings.

### 2. DISPATCHER
Handles day-to-day delivery assignments and dispatch workflows.
- **Scope**: Scheduling, assigning vehicles/drivers, dispatching cargo, trip completions.

### 3. SAFETY_OFFICER
Monitors driver compliance, licensing validity, safety scores, and safety metrics.
- **Scope**: Drivers profiles, safety records, license expiry checks.

### 4. FINANCIAL_ANALYST
Monitors fuel logs, operational expenses, ROI metrics, and financial reporting.
- **Scope**: FuelLogs, Expenses, Finance Analytics.
