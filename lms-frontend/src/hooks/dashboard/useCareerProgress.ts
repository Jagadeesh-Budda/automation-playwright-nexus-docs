import { useMasteryStore } from '../../store/useMasteryStore';
import { STAGES } from '../../data/stageConfig';

export function useCareerProgress() {
  const { getStageProgress } = useMasteryStore();

  const totalLessonsInPath = STAGES.reduce((acc, s) => acc + (getStageProgress(s.key)?.total || 0), 0);
  const totalCompletedInPath = STAGES.reduce((acc, s) => acc + (getStageProgress(s.key)?.completed || 0), 0);
  const totalRemainingInPath = totalLessonsInPath - totalCompletedInPath;
  const estimatedMonths = Math.max(1, Math.ceil(totalRemainingInPath / 15));
  const graduationDate = new Date();
  graduationDate.setMonth(graduationDate.getMonth() + estimatedMonths);
  const estimatedGraduationString = graduationDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase();

  return {
    totalLessonsInPath,
    totalCompletedInPath,
    totalRemainingInPath,
    estimatedGraduationString
  };
}
