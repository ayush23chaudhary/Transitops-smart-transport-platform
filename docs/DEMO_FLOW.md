# TransitOps Demonstration Walkthrough

This document outlines the step-by-step scenario to demonstrate the TransitOps platform capabilities for evaluators.

---

## Scenario Step-by-Step

### 1. Platform Login & RBAC Behavior
1. Open the browser to your deployed URL.
2. Observe the login credentials helper at the bottom.
3. Sign in using the **Dispatcher** credentials:
   - **Email**: `dispatcher@transitops.com`
   - **Password**: `dispatcher123`
4. Notice that the sidebar opens and redirects to the **Operations Dashboard** overview.
5. In the topbar and bottom of the sidebar, verify the logged-in name and the `DISPATCHER` role badge.

---

### 2. View Operations Dashboard
1. Observe the live KPI metrics:
   - **Fleet Utilization**: calculated automatically based on active `ON_TRIP` trucks.
   - **Drivers On Duty**: counts active or available drivers.
   - **Active Dispatches**: displays trips currently en route.
   - **Vehicles In Shop**: shows trucks undergoing active maintenance.
2. Review the **Recent Dispatches** logs table showing actual routes, cargo weight, distance, and status badges.
3. Inspect the **Fleet Distribution** progress bar breakdown showing available, active, and maintenance trucks.

---

### 3. Create Draft & Real-Time Capacity Warning
1. Navigate to the **Trips** page using the sidebar.
2. Click **Create Draft Trip** in the header.
3. Select the vehicle `TX-789-AB - Heavy Duty Volvo FH16 (Max: 25000kg)`.
4. Change **Cargo Weight** to `30000` (which exceeds the vehicle's 25,000 kg capacity).
5. Observe the immediate red real-time validation error:
   `Vehicle capacity: 25000 kg. Cargo weight: 30000 kg. Capacity exceeded by 5000 kg. Dispatch blocked.`
6. Attempt to submit: scheduling fails with a specific error toast alert.
7. Change the **Cargo Weight** back to `18000` kg (safe limit).
8. Click **Save Draft** and verify the success toast.

---

### 4. Attempt Invalid Dispatch (Safety Guard)
1. Select the draft trip from the list to display details in the side panel.
2. The dropdown forms for available vehicles and drivers only list dispatch-eligible resources (excluding `ON_TRIP`, `IN_SHOP`, `RETIRED`, `OFF_DUTY`, or `SUSPENDED` personnel).
3. If an invalid assignment is pushed directly to the backend API, the transaction will be rolled back, and the backend will return a structured error (e.g. license expired, vehicle busy, or driver suspended).

---

### 5. Perform Valid Dispatch
1. Ensure the draft trip has an `AVAILABLE` driver and vehicle assigned.
2. Click **Dispatch Cargo** in the side panel and confirm the modal dialog.
3. Observe:
   - Trip status transitions to `DISPATCHED` with a blue badge.
   - The vehicle status transitions to `ON_TRIP` (verifiable in the **Vehicles** page).
   - The driver status transitions to `ON_TRIP` (verifiable in the **Drivers** page).

---

### 6. Complete Trip & Resource Release
1. Select the dispatched trip from the list.
2. Click **Complete Trip**.
3. Fill out the completion fields:
   - **Actual Distance**: `240` km.
   - **End Odometer**: `152240` km (previous odometer was `152000.5`).
   - **Attributed Revenue ($)**: `1200` *(Optional)*.
4. Click **Submit Completion**.
5. Observe:
   - Trip transitions to `COMPLETED` (green badge).
   - Vehicle and driver statuses transition back to `AVAILABLE`.
   - Vehicle's odometer updates to the new mileage.

---

### 7. Fleet Maintenance Flow
1. Navigate to the **Maintenance** page.
2. Click **Schedule Maintenance** and select an available vehicle.
3. Once scheduled, click the **Start** button (`Play` icon) on the row and confirm the modal dialog.
4. Observe:
   - Maintenance transitions to `IN_PROGRESS` (blue badge).
   - The vehicle status transitions to `IN_SHOP` (orange badge).
   - Go back to the **Trips** page, click **Create Draft Trip**, and verify that the vehicle is **no longer visible** in the eligible vehicles pool.
