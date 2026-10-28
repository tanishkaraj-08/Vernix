import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { InstitutionDirectoryPage } from './pages/InstitutionDirectoryPage';
import { InstitutionDetailPage } from './pages/InstitutionDetailPage';
import { ComplaintRegistryPage } from './pages/ComplaintRegistryPage';
import { ComplaintDetailPage } from './pages/ComplaintDetailPage';
import { OverlapDetectionPage } from './pages/OverlapDetectionPage';
import { CaseTrackingPage } from './pages/CaseTrackingPage';
import { SlaMonitoringPage } from './pages/SlaMonitoringPage';
import { BureauCoordinationPage } from './pages/BureauCoordinationPage';
import { CaseGraphPage } from './pages/CaseGraphPage';
import { ReportsPage } from './pages/ReportsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="institutions" element={<InstitutionDirectoryPage />} />
          <Route path="institutions/:id" element={<InstitutionDetailPage />} />
          <Route path="complaints" element={<ComplaintRegistryPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="overlap-detection" element={<OverlapDetectionPage />} />
          <Route path="case-tracking" element={<CaseTrackingPage />} />
          <Route path="sla-monitoring" element={<SlaMonitoringPage />} />
          <Route path="coordination" element={<BureauCoordinationPage />} />
          <Route path="case-graph" element={<CaseGraphPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
