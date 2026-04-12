import { useEffect, useRef } from 'react';
import {
  Chart,
  type ChartConfiguration,
  type ChartType,
  registerables,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

export function useChart<TType extends ChartType>(
  config: ChartConfiguration<TType> | null,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<TType> | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !config) return;
    const instance = new Chart<TType>(canvasRef.current, config);
    chartRef.current = instance;
    return () => {
      instance.destroy();
      chartRef.current = null;
    };
  }, [config]);

  return canvasRef;
}
