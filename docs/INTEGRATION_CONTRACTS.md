# Integration Contracts

This document outlines the contracts, fields, and endpoints that the **Trips** module expects from the other three modules.

## Vehicle Contract (Fleet Module)

To support scheduling and dispatch verification, the Vehicle entity must expose the following attributes:

- `id`: UUID Primary Key
- `registrationNumber`: String (Unique index)
- `name`: String
- `type`: String
- `maxLoadCapacity`: Decimal (Used to verify `cargoWeight <= maxLoadCapacity` on dispatch)
- `odometer`: Decimal (Current mileage, used to set `startOdometer` and update vehicle mileage on completion)
- `status`: VehicleStatus Enum (`AVAILABLE`, `ON_TRIP`, `IN_SHOP`, `RETIRED`)

### Expected Endpoints
- `GET /api/vehicles`: Returns all active vehicles.
- `GET /api/vehicles/available`: Returns only vehicles with status `AVAILABLE` and `isActive` true.

---

## Driver Contract (Workforce Module)

To support scheduling and safety checks, the Driver entity must expose:

- `id`: UUID Primary Key
- `name`: String
- `email`: String
- `phone`: String
- `licenseNumber`: String
- `licenseCategory`: String
- `licenseExpiryDate`: DateTime (Used to block dispatches if expired)
- `safetyScore`: Decimal (Range: 0.00 to 10.00)
- `status`: DriverStatus Enum (`AVAILABLE`, `ON_TRIP`, `OFF_DUTY`, `SUSPENDED`)

### Expected Endpoints
- `GET /api/drivers`: Returns all active drivers.
- `GET /api/drivers/available`: Returns only drivers with status `AVAILABLE` and `isActive` true.
