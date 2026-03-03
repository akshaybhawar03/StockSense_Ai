const fs = require('fs');
const https = require('https');
const path = require('path');

const logosPath = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(logosPath)) {
    fs.mkdirSync(logosPath, { recursive: true });
}

const brands = [
    { file: 'amazon-full.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/amazon.svg' },
    { file: 'shopify.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/shopify.svg' },
    { file: 'google.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/google.svg' },
    { file: 'meta.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/meta.svg' },
    { file: 'woo.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/woocommerce.svg' },
    { file: 'flipkart.svg', url: 'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/flipkart.svg' },
];

async function download(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    fs.writeFileSync(dest, data);
                    resolve(true);
                });
            } else {
                console.log(`Failed to download ${url}: ${res.statusCode}`);
                resolve(false);
            }
        }).on('error', reject);
    });
}

function createTextSVG(name) {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="32" fill="currentColor">${name}</text>
</svg>`;
}

async function main() {
    for (const brand of brands) {
        const dest = path.join(logosPath, brand.file);
        await download(brand.url, dest);
        console.log(`Downloaded ${brand.file}`);
    }

    // Create clean text SVGs for Meesho and Myntra
    fs.writeFileSync(path.join(logosPath, 'meesho.svg'), createTextSVG('Meesho'));
    console.log('Created meesho.svg');

    fs.writeFileSync(path.join(logosPath, 'myntra.svg'), createTextSVG('Myntra'));
    console.log('Created myntra.svg');
}

main().catch(console.error);
