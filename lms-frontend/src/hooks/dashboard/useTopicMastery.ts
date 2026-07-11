import { useMasteryStore } from '../../store/useMasteryStore';
import modulesData from '../../data/metadata.json';

export function useTopicMastery() {
  const { completedModules } = useMasteryStore();

  const calculateTopicMastery = (keywords: string[]) => {
    const topicModules = modulesData.filter(m => 
      keywords.some(kw => 
        m.group?.toLowerCase().includes(kw.toLowerCase()) || 
        m.title?.toLowerCase().includes(kw.toLowerCase())
      )
    );
    if (topicModules.length === 0) return 0;
    const completed = topicModules.filter(m => completedModules.includes(m.id)).length;
    return Math.round((completed / topicModules.length) * 100);
  };

  const getTopicProgressDetails = (keywords: string[]) => {
    const topicModules = modulesData.filter(m => 
      keywords.some(kw => 
        m.group?.toLowerCase().includes(kw.toLowerCase()) || 
        m.title?.toLowerCase().includes(kw.toLowerCase())
      )
    );
    const total = topicModules.length;
    const completed = topicModules.filter(m => completedModules.includes(m.id)).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return {
      percent,
      completed,
      total,
      remaining: Math.max(0, total - completed)
    };
  };

  return {
    locators: calculateTopicMastery(['locator', 'action']),
    assertions: calculateTopicMastery(['assert', 'core']),
    network: calculateTopicMastery(['api', 'network', 'hybrid']),
    fixtures: calculateTopicMastery(['fixture', 'architecture', 'extend']),
    api: calculateTopicMastery(['api']),
    architecture: calculateTopicMastery(['architecture', 'framework']),
    getTopicProgressDetails
  };
}
