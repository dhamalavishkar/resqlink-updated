import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { RescueMeshPage } from './pages/RescueMeshPage';
import { IncidentReportsPage } from './pages/IncidentReportsPage';
import { RescueOperationsPage } from './pages/RescueOperationsPage';
import { AIBriefingPage } from './pages/AIBriefingPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/overview" />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/live-map" element={<LiveMapPage />} />
          <Route path="/ai-vision" element={<Navigate replace to="/live-map" />} />
          <Route path="/field-reporter" element={<Navigate replace to="/live-map" />} />
          <Route path="/rescue-mesh" element={<RescueMeshPage />} />
          <Route path="/incident-reports" element={<IncidentReportsPage />} />
          <Route path="/rescue-operations" element={<RescueOperationsPage />} />
          <Route path="/ai-briefing" element={<AIBriefingPage />} />
          <Route path="*" element={<Navigate replace to="/overview" />} />
        </Routes>
      </MainLayout>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;