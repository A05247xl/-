import Papa from 'papaparse';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1wTnyab2859qNO4VfDV3P07RJBQMm5cqP/gviz/tq?tqx=out:csv&sheet=' + encodeURIComponent('測驗題');

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    Papa.parse(data, {
      header: true,
      complete: (results) => {
        console.log("Headers:");
        const len = results.data.length;
        console.log("Total length:", len);
        if (len > 0) {
            console.log(Object.keys(results.data[0]));
            
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
            
            let essayFieldCount = 0;
            for(let i=0; i<len; i++) {
                if(hasEssayFields(results.data[i])) {
                    essayFieldCount++;
                }
            }
            console.log("How many quiz rows have essay fields?", essayFieldCount);
            
            if (essayFieldCount > 0) {
              const quizWithEssay = results.data.find(r => hasEssayFields(r));
              console.log("First quiz row with essay fields:", quizWithEssay);
            }
        }
      }
    });
  });
});
