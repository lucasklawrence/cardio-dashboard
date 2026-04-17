/** Build a chartjs-plugin-annotation config for a horizontal dashed goal line. Returns {} when no goal is set. */
export function goalAnnotation(goalValue: number | null) {
  if (goalValue == null) return {};
  return {
    annotations: {
      goalLine: {
        type: 'line' as const,
        yMin: goalValue,
        yMax: goalValue,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderDash: [6, 4],
        borderWidth: 1,
        label: {
          content: `Goal: ${goalValue}`,
          display: true,
          position: 'end' as const,
          font: { family: 'DM Mono', size: 10 },
          color: 'rgba(255, 255, 255, 0.5)',
        },
      },
    },
  };
}
