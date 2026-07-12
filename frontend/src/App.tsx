import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { VehiclesPage } from './features/vehicles/VehiclesPage';
import { DriversPage } from './features/drivers/DriversPage';
import { TripsPage } from './features/trips/TripsPage';
import { MaintenancePage } from './features/maintenance/MaintenancePage';
import { FinancePage } from './features/finance/FinancePage';
import { AnalyticsPage } from './features/analytics/AnalyticsPage';
import { SettingsPage } from './features/settings/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Layout wrapper */}
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="drivers" element={<DriversPage />} />
          <Route path="trips" element={<TripsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
