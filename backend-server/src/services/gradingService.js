const answerKeys = require('../data/answerKeys');

class GradingService {
    /**
     * Grades the submitted answers against the secure master key.
     * @param {string} moduleId - The ID of the module (e.g., 'fundamentals-cli')
     * @param {Object} submittedAnswers - Format: { questionId: "User Answer" }
     * @returns {Object} { score: number, pass: boolean, details: Object }
     */
    gradeModule(moduleId, submittedAnswers) {
        const masterKey = answerKeys[moduleId];

        if (!masterKey) {
            throw new Error(`Module ID '${moduleId}' not found in answer key.`);
        }

        const questionIds = Object.keys(masterKey);
        const totalQuestions = questionIds.length;
        
        if (totalQuestions === 0) {
            return { score: 100, pass: true, details: {} };
        }

        let correctCount = 0;
        const details = {};

        for (const qId of questionIds) {
            const correctAnswer = masterKey[qId];
            const userAnswer = submittedAnswers[qId];

            const isCorrect = userAnswer === correctAnswer;
            if (isCorrect) correctCount++;

            // Optional: return which questions were wrong without giving the correct answer
            details[qId] = isCorrect ? 'CORRECT' : 'INCORRECT';
        }

        const score = Math.round((correctCount / totalQuestions) * 100);
        // Assuming 80% is the passing grade
        const pass = score >= 80;

        return {
            score,
            pass,
            details
        };
    }
}

module.exports = new GradingService();
