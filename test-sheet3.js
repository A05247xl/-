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
        console.log("length of 申論:", results.data.length);
        
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
        
        const hasEssayFields = (row) => !!(
            getVal(row, ['擬答要點', 'KeyPoints', 'Key Points', '評分要點', '參考解答', '解答提示']) ||
            getVal(row, ['完整參考擬答內容', '完整解答', '詳細解答', 'FullAnswer', 'Full Answer'])
        );
        
        let valid = 0;
        let withQuestion = 0;
        results.data.forEach(row => {
           if (getVal(row, ['Question', '問題', '題目', '題幹', '題目內容'])) {
               withQuestion++;
               if (hasEssayFields(row)) valid++;
           }
        });
        console.log("With question:", withQuestion, "Valid:", valid);
      }
    });
  });
});
