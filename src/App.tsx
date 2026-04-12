import { HealthDataProvider, useHealthDataContext } from './state/HealthDataContext';
import { useFileLoader } from './hooks/useFileLoader';
import { Header } from './components/Header';
import { UploadZone } from './components/upload/UploadZone';
import { LoadingProgress } from './components/upload/LoadingProgress';
import { Dashboard } from './components/Dashboard';

function AppShell() {
  const { healthData } = useHealthDataContext();
  const { load, loading, stages, error } = useFileLoader();

  return (
    <div className="app">
      <Header />
      {!healthData && !loading && <UploadZone onFile={load} />}
      {loading && <LoadingProgress stages={stages} error={null} />}
      {error && !loading && <LoadingProgress stages={stages} error={error} />}
      {healthData && !loading && <Dashboard />}
    </div>
  );
}

export function App() {
  return (
    <HealthDataProvider>
      <AppShell />
    </HealthDataProvider>
  );
}
