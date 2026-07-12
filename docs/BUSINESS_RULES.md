# Business Rules & Invariants

This document outlines the operational constraints, validation rules, and database invariants that must be enforced by both application validation and database transactions.

## Database Invariants

1. **Trip Assignments**:
   - A vehicle can have many historical trips, but it cannot participate in more than one active `DISPATCHED` trip simultaneously.
   - A driver can have many historical trips, but they cannot participate in more than one active `DISPATCHED` trip simultaneously.
   - Only `AVAILABLE` vehicles can be dispatched. Vehicles in `ON_TRIP`, `IN_SHOP`, or `RETIRED` states cannot be dispatched.
   - Only `AVAILABLE` drivers can be dispatched. Drivers who are `ON_TRIP`, `OFF_DUTY`, or `SUSPENDED` cannot be dispatched.
   - Drivers with expired licenses (`licenseExpiryDate < now()`) cannot be dispatched.

2. **Cargo Capacity**:
   - Cargo weight (`cargoWeight`) cannot exceed the vehicle's maximum load capacity (`maxLoadCapacity`).

3. **Fuel & Expenses**:
   - `FuelLog` must always belong to a `Vehicle` and may optionally link to a `Trip`.
   - `Expense` may optionally belong to a `Vehicle` and/or a `Trip`.
   - Fuel cost must not be duplicated in `Expense` (fuel costs belong exclusively to `FuelLog`).

4. **State Management**:
   - Current operational state is stored on the `Vehicle` and `Driver` records.
   - Historical state is represented through the `Trip` and `MaintenanceRecord` logs.

## Core State Transitions & Transaction Boundaries

### 1. Dispatch Trip Transaction
When a Trip transitions from `DRAFT` to `DISPATCHED`:
1. Trip status transitions from `DRAFT` to `DISPATCHED`.
2. Sets `dispatchedAt` to the current timestamp.
3. Assigned Vehicle status transitions from `AVAILABLE` to `ON_TRIP`.
4. Assigned Driver status transitions from `AVAILABLE` to `ON_TRIP`.
*Must run atomically inside a database transaction.*

### 2. Complete Trip Transaction
When a Trip transitions from `DISPATCHED` to `COMPLETED`:
1. Trip status transitions from `DISPATCHED` to `COMPLETED`.
2. Sets `completedAt` to the current timestamp.
3. Updates `actualDistance` and `endOdometer` based on completion input.
4. Assigned Vehicle status transitions from `ON_TRIP` to `AVAILABLE`.
5. Updates Vehicle's current `odometer` to match `endOdometer`.
6. Assigned Driver status transitions from `ON_TRIP` to `AVAILABLE`.
*Must run atomically inside a database transaction.*

### 3. Cancel Trip Transaction
- **DRAFT Trip**: Trip status changes to `CANCELLED`.
- **DISPATCHED Trip**: 
  1. Trip status changes to `CANCELLED`.
  2. Sets `cancelledAt` to the current timestamp.
  3. Assigned Vehicle status transitions from `ON_TRIP` to `AVAILABLE`.
  4. Assigned Driver status transitions from `ON_TRIP` to `AVAILABLE`.
  *Must run atomically inside a database transaction.*
- **COMPLETED Trip**: Cannot be cancelled (invalid transition).

### 4. Maintenance State Transitions
- When maintenance transitions to `IN_PROGRESS`:
  - `MaintenanceRecord` status -> `IN_PROGRESS`.
  - `Vehicle` status -> `IN_SHOP`.
- When maintenance transitions to `COMPLETED`:
  - `MaintenanceRecord` status -> `COMPLETED`.
  - `Vehicle` status -> `AVAILABLE`.
*Must run atomically.*
