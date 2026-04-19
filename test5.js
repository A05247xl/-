import Papa from 'papaparse';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1wTnyab2859qNO4VfDV3P07RJBQMm5cqP/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent('申論題');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    Papa.parse(data, {
      header: true,
      complete: (results) => {
        function getVal(row, possibleKeys) {
            const normalizedRow = {};
            for (const key in row) {
                const cleanKey = key.replace(/\s+/g, '').toLowerCase();
                normalizedRow[cleanKey] = row[key];
            }
            for (const pk of possibleKeys) {
                const cleanPk = pk.replace(/\s+/g, '').toLowerCase();
                if (normalizedRow[cleanPk] !== undefined && normalizedRow[cleanPk] !== '') {
                    return String(normalizedRow[cleanPk]).trim();
                }
            }
            return '';
        }
        
        const hasQuizFields = (row) => !!(
            getVal(row, ['OptionA', 'Option A', '選項A', '選項 A', 'A']) ||
            getVal(row, ['OptionB', 'Option B', '選項B', '選項 B', 'B']) ||
            getVal(row, ['Answer', '答案', '解答', '正解', '正確答案'])
        );
        
        let quizFieldCount = 0;
        let withQuestion = 0;
        results.data.forEach(row => {
           if (getVal(row, ['Question', '問題', '題目', '題幹', '題目內容'])) {
               withQuestion++;
               if (hasQuizFields(row)) quizFieldCount++;
           }
        });
        console.log("length of 申論:", results.data.length);
        console.log("With question:", withQuestion, "Has quiz fields:", quizFieldCount);
      }
    });
  });
});
