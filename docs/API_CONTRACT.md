# API Contract

This document specifies the communication format and endpoints available in the TransitOps API.

## Canonical Response Formats

All API endpoints must return one of the following JSON schemas.

### 1. Success Response
```json
{
  "success": true,
  "data": {}
}
```

### 2. Error Response
```json
{
  "success": false,
  "message": "Human readable error message"
}
```

---

## Endpoint Specifications

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Auth Required**: No
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "status": "ok"
    }
  }
  ```

### Authentication
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "dispatcher@transitops.com",
    "password": "dispatcher123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "uuid-string",
        "name": "Lead Dispatcher",
        "email": "dispatcher@transitops.com",
        "role": "DISPATCHER"
      }
    }
  }
  ```

---

## Trips (Team Lead Module)

All trip routes require an `Authorization: Bearer <token>` header.

### 1. List Trips
- **URL**: `/api/trips`
- **Method**: `GET`
- **Query Params**: `status` (optional, filter: `DRAFT`, `DISPATCHED`, `COMPLETED`, `CANCELLED`)
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`, `VIEWER`

### 2. Get Trip Details
- **URL**: `/api/trips/:id`
- **Method**: `GET`
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`, `VIEWER`

### 3. Create Draft Trip
- **URL**: `/api/trips`
- **Method**: `POST`
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`
- **Body**:
  ```json
  {
    "tripNumber": "TRIP-105",
    "source": "Houston Depot",
    "destination": "Austin Hub",
    "vehicleId": "uuid-string",
    "driverId": "uuid-string",
    "cargoWeight": 12500.00,
    "plannedDistance": 165.20,
    "scheduledAt": "2026-07-15T10:00:00.000Z"
  }
  ```

### 4. Dispatch Trip
- **URL**: `/api/trips/:id/dispatch`
- **Method**: `POST`
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`

### 5. Complete Trip
- **URL**: `/api/trips/:id/complete`
- **Method**: `POST`
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`
- **Body**:
  ```json
  {
    "actualDistance": 168.50,
    "endOdometer": 152169.00
  }
  ```

### 6. Cancel Trip
- **URL**: `/api/trips/:id/cancel`
- **Method**: `POST`
- **Roles**: `ADMIN`, `MANAGER`, `DISPATCHER`
