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
        console.log("length:", results.data.length);
        console.log("Row 479:", Object.values(results.data[479]).join(' | '));
        console.log("Row 480:", Object.values(results.data[480]).join(' | '));
        console.log("Row 481:", Object.values(results.data[481]).join(' | '));
        console.log("Last row:", Object.values(results.data[results.data.length - 1]).join(' | '));
      }
    });
  });
});
