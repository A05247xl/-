import Papa from 'papaparse';
import https from 'https';

const url = 'https://docs.google.com/spreadsheets/d/1wTnyab2859qNO4VfDV3P07RJBQMm5cqP/export?format=csv&gid=727827830';

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    Papa.parse(data, {
      header: true,
      complete: (results) => {
        console.log("length of gid=727827830:", results.data.length);
        console.log("first row:", results.data[0]);
        if (results.data.length > 480) {
           console.log("Row 480:", results.data[480]);
        }
      }
    });
  });
});
