export const generateChartPath = (completedChaptersCount: number) => {
  if (completedChaptersCount === 0) return { line: "M0,38 L100,38", fill: "M0,38 L100,38 L100,40 L0,40 Z" };
  
  const points = [38];
  let currentY = 38;
  
  for (let i = 1; i < 7; i++) {
    const pseudoRand = ((completedChaptersCount * i * 17) % 10) / 10;
    const progressFactor = Math.min(completedChaptersCount / 5, 1);
    const moveUp = pseudoRand * 12 * progressFactor;
    const move = moveUp - (i % 3 === 0 ? 3 : 0);
    currentY = Math.max(5, Math.min(38, currentY - move));
    points.push(currentY);
  }
  
  let path = `M0,${points[0].toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const x0 = (i - 1) * (100 / 6);
    const y0 = points[i - 1];
    const x1 = i * (100 / 6);
    const y1 = points[i];
    const cx = x0 + (x1 - x0) / 2;
    path += ` C${cx.toFixed(1)},${y0.toFixed(1)} ${cx.toFixed(1)},${y1.toFixed(1)} ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  
  return {
    line: path,
    fill: `${path} L100,40 L0,40 Z`
  };
};
