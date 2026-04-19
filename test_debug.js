import { loadDataFromSheet } from './src/services/sheetsService.js';

(async () => {
    try {
        const data = await loadDataFromSheet('1wTnyab2859qNO4VfDV3P07RJBQMm5cqP');
        console.log("Quizzes count:", data.quizzes.length);
        console.log("Essays count:", data.essays.length);
        if (data.essays.length > 52) {
            console.log("First extra essay item:", data.essays[0]);
            console.log("Item 480:", data.essays[480]);
        }
    } catch (e) {
        console.error(e);
    }
})();
