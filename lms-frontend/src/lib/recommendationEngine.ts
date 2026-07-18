import modulesData from '../data/metadata.json';

export interface PrerequisiteStatus {
  status: 'green' | 'yellow' | 'red';
  prerequisiteModule: any | null;
  message: string;
}

export interface QuizRefresher {
  weakConcepts: string[];
  suggestedRevisionTime: string;
  relatedLessons: { id: string; title: string; slug: string }[];
}

export class RecommendationEngine {
  /**
   * Identifies the current level difficulty status based on completed prerequisites
   */
  static checkPrerequisites(
    moduleId: string, 
    completedModules: string[], 
    selectedPath: 'all' | 'foundations' | 'enterprise' | 'regulated'
  ): PrerequisiteStatus {
    const currentModule = modulesData.find(m => m.id === moduleId);
    if (!currentModule) {
      return { status: 'green', prerequisiteModule: null, message: '' };
    }

    // Filter modules based on learning path
    const pathModules = selectedPath === 'all'
      ? modulesData
      : modulesData.filter(m => (m as any).learningPaths?.includes(selectedPath));

    const currentIndex = pathModules.findIndex(m => m.id === moduleId);
    if (currentIndex <= 0) {
      return { status: 'green', prerequisiteModule: null, message: '' };
    }

    // Check if the immediately preceding lesson is completed
    const prevModule = pathModules[currentIndex - 1];
    const isPrevCompleted = completedModules.includes(prevModule.id);

    if (isPrevCompleted) {
      return { status: 'green', prerequisiteModule: null, message: '' };
    }

    // Check if there are multiple incomplete modules before this one
    let incompleteCount = 0;
    for (let i = 0; i < currentIndex; i++) {
      if (!completedModules.includes(pathModules[i].id)) {
        incompleteCount++;
      }
    }

    const prevTitle = prevModule.title.split(':').slice(-1)[0].trim();
    const currentTitle = currentModule.title.split(':').slice(-1)[0].trim();

    if (incompleteCount >= 3) {
      return {
        status: 'red',
        prerequisiteModule: prevModule,
        message: `May be difficult: Multiple prerequisite concepts are pending. We highly recommend completing "${prevTitle}" before "${currentTitle}" to avoid syntax confusion.`
      };
    }

    return {
      status: 'yellow',
      prerequisiteModule: prevModule,
      message: `Recommended: Complete "${prevTitle}" before "${currentTitle}" because this lesson builds directly on those base concepts.`
    };
  }

  /**
   * Recommends the next best lesson based on goals, path, and quiz score reviews
   */
  static getNextLesson(
    completedModules: string[], 
    progressMap: Record<string, number>, 
    selectedPath: 'all' | 'foundations' | 'enterprise' | 'regulated'
  ): any | null {
    // Filter modules by path
    const pathModules = selectedPath === 'all'
      ? modulesData
      : modulesData.filter(m => (m as any).learningPaths?.includes(selectedPath));

    // 1. Adaptive recommendation: If there is any lesson attempted but with a score < 80% (failed), recommend retrying it first!
    const failedAttempt = pathModules.find(m => {
      const score = progressMap[m.id];
      return score !== undefined && score < 80;
    });
    if (failedAttempt) {
      return failedAttempt;
    }

    // 2. Otherwise recommend the first uncompleted lesson
    const nextIncomplete = pathModules.find(m => !completedModules.includes(m.id));
    return nextIncomplete || null;
  }

  /**
   * Generates custom refresher topics and retry advice based on the module type
   */
  static getQuizRefresher(moduleId: string, score: number): QuizRefresher {
    let weakConcepts: string[] = ["General syntax rules"];
    let suggestedRevisionTime = "10 minutes";
    let relatedLessons: { id: string; title: string; slug: string }[] = [];

    // Derive based on module naming/details
    if (moduleId.includes('variables') || moduleId.includes('js-ts')) {
      weakConcepts = ["let vs const scope", "Primitive data types", "Async/await functions"];
      suggestedRevisionTime = "8 minutes";
      const related = modulesData.slice(0, 3);
      relatedLessons = related.map(r => ({ id: r.id, title: r.title, slug: r.slug }));
    } else if (moduleId.includes('locator') || moduleId.includes('select')) {
      weakConcepts = ["CSS locators vs XPath", "strict mode element matching", "handling multiple page matches"];
      suggestedRevisionTime = "12 minutes";
      const related = modulesData.filter(m => m.id.includes('locator'));
      relatedLessons = related.map(r => ({ id: r.id, title: r.title, slug: r.slug }));
    } else if (moduleId.includes('assert') || moduleId.includes('expect')) {
      weakConcepts = ["expect(locator).toBeVisible()", "handling soft assertions", "assert timeouts"];
      suggestedRevisionTime = "10 minutes";
      const related = modulesData.filter(m => m.id.includes('assert'));
      relatedLessons = related.map(r => ({ id: r.id, title: r.title, slug: r.slug }));
    } else if (moduleId.includes('pom') || moduleId.includes('object')) {
      weakConcepts = ["Page class design patterns", "constructor declarations", "importing POM in test specs"];
      suggestedRevisionTime = "15 minutes";
      const related = modulesData.filter(m => m.id.includes('pom'));
      relatedLessons = related.map(r => ({ id: r.id, title: r.title, slug: r.slug }));
    }

    return {
      weakConcepts,
      suggestedRevisionTime,
      relatedLessons: relatedLessons.slice(0, 3) // Keep top 3
    };
  }
}
