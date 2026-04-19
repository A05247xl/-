import { loadDataFromSheet } from './src/services/sheetsService.js';

(async () => {
    const data = await loadDataFromSheet('1wTnyab2859qNO4VfDV3P07RJBQMm5cqP');
    console.log("Quizzes:", data.quizzes.length);
    console.log("Essays:", data.essays.length);
    if (data.essays.length > 52) {
       console.log("Wait, essays has more than 52.");
       console.log("First extra row:", data.essays[0]);
    }
})();
