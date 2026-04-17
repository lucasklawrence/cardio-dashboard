import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ActivityTab, HealthData, Zones } from '../types';
import { DEFAULT_ZONES } from '../constants';

interface HealthDataContextValue {
  healthData: HealthData | null;
  setHealthData: (data: HealthData | null) => void;

  activeTab: ActivityTab;
  setActiveTab: (tab: ActivityTab) => void;

  dateFrom: Date | null;
  dateTo: Date | null;
  setDateFrom: (d: Date | null) => void;
  setDateTo: (d: Date | null) => void;
  setDatePreset: (months: number) => void;
  setDateYTD: () => void;

  zones: Zones;
  setZone: (key: keyof Zones, value: number) => void;
}

const HealthDataContext = createContext<HealthDataContextValue | null>(null);

/** Context provider that holds all shared dashboard state: health data, active tab, date filters, and HR zones. */
export function HealthDataProvider({ children }: { children: ReactNode }) {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [activeTab, setActiveTab] = useState<ActivityTab>('all');
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [zones, setZones] = useState<Zones>(DEFAULT_ZONES);

  const setZone = useCallback((key: keyof Zones, value: number) => {
    setZones((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setDatePreset = useCallback((months: number) => {
    if (months === 0) {
      setDateFrom(null);
      setDateTo(null);
      return;
    }
    const now = new Date();
    const from = new Date(now);
    from.setMonth(from.getMonth() - months);
    setDateFrom(from);
    setDateTo(null);
  }, []);

  const setDateYTD = useCallback(() => {
    const now = new Date();
    setDateFrom(new Date(now.getFullYear(), 0, 1));
    setDateTo(null);
  }, []);

  const value = useMemo<HealthDataContextValue>(
    () => ({
      healthData,
      setHealthData,
      activeTab,
      setActiveTab,
      dateFrom,
      dateTo,
      setDateFrom,
      setDateTo,
      setDatePreset,
      setDateYTD,
      zones,
      setZone,
    }),
    [healthData, activeTab, dateFrom, dateTo, zones, setZone, setDatePreset, setDateYTD],
  );

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
}

/** Access the shared health data context. Throws if used outside HealthDataProvider. */
export function useHealthDataContext(): HealthDataContextValue {
  const ctx = useContext(HealthDataContext);
  if (!ctx) {
    throw new Error('useHealthDataContext must be used within HealthDataProvider');
  }
  return ctx;
}
