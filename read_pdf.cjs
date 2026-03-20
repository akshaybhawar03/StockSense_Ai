const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('StockSense_Frontend_Remaining_PRD.docx.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
});
