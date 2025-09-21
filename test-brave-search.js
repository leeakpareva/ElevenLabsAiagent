import dotenv from 'dotenv';
dotenv.config();

console.log('Testing Brave Search API Configuration...\n');

// Check if API key is set
if (!process.env.BRAVE_API_KEY) {
    console.error('❌ BRAVE_API_KEY is not set in .env file');
    process.exit(1);
}

console.log('✅ BRAVE_API_KEY found in .env file');
console.log(`   Key starts with: ${process.env.BRAVE_API_KEY.substring(0, 10)}...`);
console.log(`   Key length: ${process.env.BRAVE_API_KEY.length} characters\n`);

// Test the API
console.log('Testing API connection...');

async function testBraveSearch() {
    try {
        const query = 'test search';
        const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

        console.log(`Making request to: ${url}\n`);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
                'X-Subscription-Token': process.env.BRAVE_API_KEY
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ API Connection Successful!');
            console.log(`   Status: ${response.status}`);
            if (data.web && data.web.results) {
                console.log(`   Results found: ${data.web.results.length}`);
                console.log('\n   First result:');
                if (data.web.results[0]) {
                    console.log(`   - Title: ${data.web.results[0].title}`);
                    console.log(`   - URL: ${data.web.results[0].url}`);
                }
            }
        } else {
            console.error('❌ API Connection Failed');
            console.error(`   Status: ${response.status}`);
            if (data.error) {
                console.error(`   Error: ${data.error.detail || data.error.message || 'Unknown error'}`);
                if (data.error.code === 'SUBSCRIPTION_TOKEN_INVALID') {
                    console.error('\n⚠️  Your Brave Search API key appears to be invalid.');
                    console.error('   Please follow these steps to get a valid API key:');
                    console.error('   1. Go to https://api.search.brave.com/');
                    console.error('   2. Sign up for a free account');
                    console.error('   3. Go to the API Keys section');
                    console.error('   4. Create a new API key');
                    console.error('   5. Copy the key and update your .env file');
                    console.error('   6. The key should look like: BSA...[long string]');
                } else if (data.error.code === 'RATE_LIMIT_EXCEEDED') {
                    console.error('\n⚠️  Rate limit exceeded. Please wait before trying again.');
                }
            }
        }
    } catch (error) {
        console.error('❌ Test failed with error:', error.message);
        console.error('   This might be a network issue. Please check your internet connection.');
    }
}

testBraveSearch();