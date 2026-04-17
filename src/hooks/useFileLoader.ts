import { useCallback, useRef, useState } from 'react';
import { PARSE_STAGES } from '../constants';
import { loadFile } from '../lib/loadFile';
import { useHealthDataContext } from '../state/HealthDataContext';
import type { ProgressStage, ProgressStatus } from '../types';

function initialStages(): ProgressStage[] {
  return PARSE_STAGES.map((s) => ({ id: s.id, label: s.label, status: 'pending' }));
}

/** React hook that manages file loading lifecycle: parsing, progress stages, and error state. */
export function useFileLoader() {
  const { setHealthData } = useHealthDataContext();
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<ProgressStage[]>(initialStages);
  const [error, setError] = useState<string | null>(null);
  const stagesRef = useRef<ProgressStage[]>(stages);
  const loadIdRef = useRef(0);

  const updateStage = useCallback((id: string, status: ProgressStatus, count?: number | string) => {
    const next = stagesRef.current.map((s) =>
      s.id === id ? { ...s, status, count: count ?? s.count } : s,
    );
    stagesRef.current = next;
    setStages(next);
  }, []);

  const load = useCallback(
    async (file: File) => {
      const loadId = ++loadIdRef.current;
      setError(null);
      setLoading(true);
      const fresh = initialStages();
      stagesRef.current = fresh;
      setStages(fresh);

      try {
        const data = await loadFile(file, (id, status, count) => {
          if (loadId !== loadIdRef.current) return;
          updateStage(id, status, count);
        });
        if (loadId === loadIdRef.current) {
          setHealthData(data);
        }
      } catch (err) {
        if (loadId === loadIdRef.current) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (loadId === loadIdRef.current) {
          setLoading(false);
        }
      }
    },
    [setHealthData, updateStage],
  );

  return { load, loading, stages, error };
}
