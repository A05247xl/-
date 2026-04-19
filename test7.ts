import { loadDataFromSheet } from './src/services/sheetsService.js';

(async () => {
    const data = await loadDataFromSheet('1wTnyab2859qNO4VfDV3P07RJBQMm5cqP');
    const essays = data.essays;
    const subjects = {};
    for(const e of essays) {
        subjects[e.subject] = (subjects[e.subject]||0) + 1;
    }
    console.log("Essays subjects:", subjects);
})();
