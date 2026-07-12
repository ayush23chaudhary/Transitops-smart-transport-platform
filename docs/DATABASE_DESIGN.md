# Database Design

This document details the relational database design for **TransitOps — Smart Transport Operations Platform**, using PostgreSQL and Prisma ORM.

## Database Entities

### 1. User
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `name`: String (Required)
- `email`: String (Required, Unique, Index)
- `passwordHash`: String (Required)
- `role`: UserRole Enum (Required)
- `isActive`: Boolean (Required, Default: `true`)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 2. Vehicle
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `registrationNumber`: String (Required, Unique, Index)
- `name`: String (Required)
- `type`: String (Required)
- `maxLoadCapacity`: Decimal (Required, Positive, Precision: 10, Scale: 2)
- `odometer`: Decimal (Required, Non-negative, Default: `0.00`)
- `acquisitionCost`: Decimal (Required, Non-negative)
- `status`: VehicleStatus Enum (Required, Default: `AVAILABLE`, Index)
- `isActive`: Boolean (Required, Default: `true`)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 3. Driver
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `name`: String (Required)
- `email`: String (Required, Unique, Index)
- `phone`: String (Required)
- `licenseNumber`: String (Required, Unique, Index)
- `licenseCategory`: String (Required)
- `licenseExpiryDate`: DateTime (Required)
- `safetyScore`: Decimal (Required, Range: 0.00 to 10.00, Default: `10.00`)
- `status`: DriverStatus Enum (Required, Default: `AVAILABLE`, Index)
- `isActive`: Boolean (Required, Default: `true`)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 4. Trip
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `tripNumber`: String (Required, Unique, Index)
- `source`: String (Required)
- `destination`: String (Required)
- `vehicleId`: UUID (Required FK, Index)
- `driverId`: UUID (Required FK, Index)
- `cargoWeight`: Decimal (Required, Non-negative)
- `plannedDistance`: Decimal (Required, Positive)
- `actualDistance`: Decimal (Nullable, Non-negative)
- `startOdometer`: Decimal (Nullable, Non-negative)
- `endOdometer`: Decimal (Nullable, Non-negative)
- `revenue`: Decimal (Nullable, Non-negative)
- `status`: TripStatus Enum (Required, Default: `DRAFT`, Index)
- `scheduledAt`: DateTime (Required, Index)
- `dispatchedAt`: DateTime (Nullable)
- `completedAt`: DateTime (Nullable)
- `cancelledAt`: DateTime (Nullable)
- `createdById`: UUID (Required FK to User, Index)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 5. MaintenanceRecord
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `vehicleId`: UUID (Required FK, Index)
- `maintenanceType`: String (Required)
- `description`: String (Required)
- `cost`: Decimal (Required, Non-negative)
- `status`: MaintenanceStatus Enum (Required, Index)
- `scheduledAt`: DateTime (Nullable)
- `startedAt`: DateTime (Nullable)
- `completedAt`: DateTime (Nullable)
- `createdById`: UUID (Required FK to User)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 6. FuelLog
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `vehicleId`: UUID (Required FK, Index)
- `tripId`: UUID (Nullable FK, Index)
- `liters`: Decimal (Required, Positive)
- `cost`: Decimal (Required, Non-negative)
- `odometerReading`: Decimal (Required, Non-negative)
- `recordedAt`: DateTime (Required, Index)
- `createdById`: UUID (Required FK to User)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 7. Expense
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `vehicleId`: UUID (Nullable FK, Index)
- `tripId`: UUID (Nullable FK, Index)
- `category`: ExpenseCategory Enum (Required)
- `amount`: Decimal (Required, Positive)
- `description`: String (Required)
- `expenseDate`: DateTime (Required, Index)
- `createdById`: UUID (Required FK to User)
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

### 8. OrganizationSettings
- `id`: UUID (Primary Key, default: `gen_random_uuid()`)
- `depotName`: String (Default: "TransitOps Default Depot")
- `currencyCode`: String (Default: "USD")
- `distanceUnit`: String (Default: "km")
- `createdAt`: DateTime (Default: `now()`)
- `updatedAt`: DateTime (Updated automatically)

## Canonical Enums

### UserRole
- `FLEET_MANAGER`
- `DISPATCHER`
- `SAFETY_OFFICER`
- `FINANCIAL_ANALYST`

### VehicleStatus
- `AVAILABLE`
- `ON_TRIP`
- `IN_SHOP`
- `RETIRED`

### DriverStatus
- `AVAILABLE`
- `ON_TRIP`
- `OFF_DUTY`
- `SUSPENDED`

### TripStatus
- `DRAFT`
- `DISPATCHED`
- `COMPLETED`
- `CANCELLED`

### MaintenanceStatus
- `SCHEDULED`
- `IN_PROGRESS`
- `COMPLETED`
- `CANCELLED`

### ExpenseCategory
- `TOLL`
- `PARKING`
- `REPAIR`
- `MAINTENANCE`
- `INSURANCE`
- `OTHER`
