import { loadDataFromSheet } from './src/services/sheetsService.js';

(async () => {
    const data = await loadDataFromSheet('1wTnyab2859qNO4VfDV3P07RJBQMm5cqP');
    const quizzes = data.quizzes;
    const essays = data.essays;
    
    // Group quizzes by subject
    const subjectQuizzes = {};
    for (const q of quizzes) {
        subjectQuizzes[q.subject] = (subjectQuizzes[q.subject] || 0) + 1;
    }
    console.log("Quizzes by subject:", subjectQuizzes);
})();
