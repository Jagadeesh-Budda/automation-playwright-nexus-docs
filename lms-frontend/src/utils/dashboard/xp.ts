export function calculateXPAndLevel({
  completedChaptersCount,
  streak,
  simulatedProjectsBuilt,
  simulatedAchievements,
  completionPercentage,
}: {
  completedChaptersCount: number;
  streak: number;
  simulatedProjectsBuilt: number;
  simulatedAchievements: number;
  completionPercentage: number;
}) {
  let tempRankIndex = 0;
  if (completionPercentage >= 20 && completionPercentage < 50) tempRankIndex = 1;
  else if (completionPercentage >= 50 && completionPercentage < 80) tempRankIndex = 2;
  else if (completionPercentage >= 80) tempRankIndex = 3;

  let calculatedXP = (completedChaptersCount * 15) + (streak > 0 ? 20 : 0);
  calculatedXP += simulatedProjectsBuilt * 250;
  calculatedXP += simulatedAchievements * 100;

  for (let i = 0; i < tempRankIndex; i++) {
    calculatedXP += (i + 1) * 500;
  }

  const level = Math.floor(calculatedXP / 100) + 1;
  return { xp: calculatedXP, level };
}
