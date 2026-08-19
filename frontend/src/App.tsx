import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { OverviewPage } from './pages/OverviewPage';
import { LiveMapPage } from './pages/LiveMapPage';
import { AIVisionPage } from './pages/AIVisionPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { RescueMeshPage } from './pages/RescueMeshPage';
import { IncidentReportsPage } from './pages/IncidentReportsPage';
import { RescueOperationsPage } from './pages/RescueOperationsPage';
import { AIBriefingPage } from './pages/AIBriefingPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Navigate replace to="/overview" />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/live-map" element={<LiveMapPage />} />
          <Route path="/ai-vision" element={<AIVisionPage />} />
          <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
          <Route path="/rescue-mesh" element={<RescueMeshPage />} />
          <Route path="/incident-reports" element={<IncidentReportsPage />} />
          <Route path="/rescue-operations" element={<RescueOperationsPage />} />
          <Route path="/ai-briefing" element={<AIBriefingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate replace to="/overview" />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;