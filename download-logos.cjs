const fs = require('fs');
const https = require('https');

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                return download(response.headers.location, dest).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

Promise.all([
    download('https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg', 'public/logos/shopify.svg'),
    download('https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 'public/logos/amazon.svg'),
    download('https://upload.wikimedia.org/wikipedia/en/7/7a/Flipkart_logo.svg', 'public/logos/flipkart.svg'),
    download('https://upload.wikimedia.org/wikipedia/commons/9/9d/WooCommerce_logo.svg', 'public/logos/woocommerce.svg')
]).then(() => console.log('All downloaded!')).catch(console.error);
