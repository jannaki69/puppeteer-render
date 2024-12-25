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