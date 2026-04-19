import Papa from 'papaparse';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1wTnyab2859qNO4VfDV3P07RJBQMm5cqP/gviz/tq?tqx=out:csv&gid=727827830';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    Papa.parse(data, {
      header: true,
      complete: (results) => {
        console.log("length of gid=727827830:", results.data.length);
        if (results.data.length > 0) {
            console.log("Headers:", Object.keys(results.data[0]));
            if (results.data.length > 479) {
                console.log("Row 479:", Object.values(results.data[479]).slice(0, 5).join(' | '));
            }
            if (results.data.length > 480) {
                console.log("Row 480:", Object.values(results.data[480]).slice(0, 5).join(' | '));
            }
        }
      }
    });
  });
});
