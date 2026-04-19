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

        let count = 0;
        let lastEssay = null;
        let index = 0;
        results.data.forEach(row => {
            index++;
            if (hasEssayFields(row)) {
                count++;
                if (!lastEssay) lastEssay = { index, row };
            }
        });
        console.log("Total rows in 測驗題:", results.data.length);
        console.log("Rows with essay fields:", count);
        if (count > 0) {
            console.log("First offending row:", lastEssay);
        }
      }
    });
  });
});
