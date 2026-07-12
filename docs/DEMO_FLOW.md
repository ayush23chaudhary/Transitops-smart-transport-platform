# Demo Flow Scenario

This document outlines the step-by-step scenario to demonstrate the platform capabilities during the hackathon.

## Scenario Step-by-Step

### 1. Platform Login
1. Open the browser to the frontend url.
2. Sign in using the Dispatcher credentials:
   - **Email**: `dispatcher@transitops.com`
   - **Password**: `dispatcher123`
3. Notice that the sidebar opens and redirects to the **Overview** dashboard.

### 2. View Overview Dashboard
1. Observe the four KPI metrics retrieved from `GET /api/analytics/summary`:
   - Total Vehicles (5)
   - Active Drivers (5)
   - Active Dispatches (1)
   - Trips in Draft (1)

### 3. Manage Trips (Draft creation and validation check)
1. Navigate to the **Trips** page using the sidebar.
2. Click **Create Draft Trip** in the header.
3. Fill out the form with a new trip:
   - **Trip Number**: `TRIP-005`
   - **Source**: `Houston Warehouse`
   - **Destination**: `San Antonio Hub`
   - **Scheduled Start**: Choose a date/time tomorrow.
   - **Cargo Weight**: `10000` kg.
   - **Planned Distance**: `198` km.
   - **Vehicle**: Select `TX-789-AB - Heavy Duty Volvo FH16 (Max: 25000kg)`.
   - **Driver**: Select `John Doe (Class A CDL)`.
4. Click **Save Draft**. Look for the success toast.
5. Select `TRIP-005` from the list to display details in the side panel.

### 4. Dispatch a Cargo Trip
1. In the detail drawer for `TRIP-005`, click **Dispatch Cargo**.
2. Confirm the action in the dialog modal.
3. Observe:
   - Trip status transitions to `DISPATCHED`.
   - The vehicle status transitions to `ON_TRIP` (verifiable in the **Vehicles** listing page).
   - The driver status transitions to `ON_TRIP` (verifiable in the **Drivers** listing page).

### 5. Complete a Dispatched Trip
1. Select the active `TRIP-002` (dispatched to phoenix) or `TRIP-005`.
2. In the detail drawer, click **Complete Trip**.
3. Input the completion fields:
   - **Actual Distance**: `198`
   - **End Odometer**: Input current odometer + 198 (e.g. `152200`).
4. Click **Submit Completion**.
5. Observe:
   - Trip status transitions to `COMPLETED`.
   - The vehicle and driver release back to `AVAILABLE` status.
   - The vehicle's odometer updates to match the end odometer.
