async function fetchAndSearch(url, searchTerm) {
    try {
        // Fetch the HTML content from the provided URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.statusText}`);
        }
        
        const html = await response.text();
        
        // Create a DOM parser to parse the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Search for the specific data in the parsed HTML content
        // For this example, let's assume we are looking for elements with a specific class name
        const elements = doc.querySelectorAll(`.${searchTerm}`);
        
        // Extract and log the text content of the found elements
        elements.forEach(element => {
            console.log(element.textContent);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

// Example usage
const url = 'https://example.com'; // Replace with the URL of the HTML page you want to fetch
const searchTerm = 'specific-class-name'; // Replace with the class name or other search criteria

fetchAndSearch(url, searchTerm);
////////////////////////////////////////////////////////////

const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');

    const client = await page.target().createCDPSession();
    await client.send('Page.enable');
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });

    fs.writeFileSync('page.mhtml', data);

    await browser.close();
})();
////////////////////////////////////////////////////////////
const puppeteer = require('puppeteer');
const fs = require('fs');
const { exec } = require('child_process');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://example.com');

    const client = await page.target().createCDPSession();
    await client.send('Page.enable');
    const { data } = await client.send('Page.captureSnapshot', { format: 'mhtml' });

    const mhtmlPath = 'page.mhtml';
    fs.writeFileSync(mhtmlPath, data);

    await browser.close();

    // Convert .mhtml to .odt using LibreOffice
    exec(`soffice --headless --convert-to odt ${mhtmlPath}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error converting file: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Conversion stderr: ${stderr}`);
            return;
        }
        console.log(`Conversion stdout: ${stdout}`);
    });
})();

