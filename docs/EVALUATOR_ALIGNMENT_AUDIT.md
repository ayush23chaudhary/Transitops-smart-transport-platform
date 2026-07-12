# Evaluator Alignment Audit

This document records the gap analysis between the existing TransitOps implementation and the requirements outlined in the evaluator wireframes.

| Requirement | Current State | Status | Required Change | Owner |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication & RBAC** | JWT Auth middleware is implemented. Uses `ADMIN`, `MANAGER`, `DISPATCHER`, `VIEWER` roles. | **PARTIALLY_ALIGNED** | Update the database `UserRole` enum values to map exactly to the wireframe roles: `FLEET_MANAGER`, `DISPATCHER`, `SAFETY_OFFICER`, `FINANCIAL_ANALYST`. | **WORKFORCE DEVELOPER** / **SHARED FOUNDATION** |
| **Operational Dashboard** | Summary endpoint for active/pending trip counts is implemented and rendered in KPI cards. | **ALIGNED** | None. Dashboard UI is a skeleton ready for further metrics. | **INTELLIGENCE DEVELOPER** |
| **Vehicle Registry** | Relational `Vehicle` model and schema constraints exist. Frontend shows registry table skeleton. | **ALIGNED** | Full CRUD implementation is deferred to the Fleet developer. | **FLEET DEVELOPER** |
| **Driver Rosters & Safety** | Relational `Driver` model with safety score and license checks exists. | **ALIGNED** | Driver profile screens are deferred to Workforce developer. | **WORKFORCE DEVELOPER** |
| **Trip Dispatch Lifecycle** | Full state machine (Draft -> Dispatched -> Completed/Cancelled) is implemented via database transactions. | **ALIGNED** | Add a nullable `revenue` field to the Trip model to support financial metrics. | **TEAM LEAD / TRIPS** |
| **Fuel & Expense Logs** | DB models exist and show in list skeletons. Fuel costs are separate from general expenses. | **ALIGNED** | Fuel log and expense entries screens are deferred to Intelligence developer. | **INTELLIGENCE DEVELOPER** |
| **Maintenance Workflows** | MaintenanceRecord model exists. | **ALIGNED** | Scheduling and workshop state logic are deferred to Fleet developer. | **FLEET DEVELOPER** |
| **Reports & ROI Analytics** | Analysis page is a skeleton. Database lacks a revenue source to compute ROI. | **PARTIALLY_ALIGNED** | Introduce nullable `Trip.revenue` field. Document mathematical definitions for ROI, fuel efficiency, and fleet utilization. | **INTELLIGENCE DEVELOPER** / **SHARED FOUNDATION** |
| **Organization Settings** | Settings page exists on frontend but lacks database backing. | **MISSING** | Add a simple `OrganizationSettings` database entity to persist depot name, currency, and unit preferences. | **SHARED FOUNDATION** |
