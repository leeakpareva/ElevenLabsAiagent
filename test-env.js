import dotenv from 'dotenv';
dotenv.config();

console.log('Environment Variables Test:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ?
    process.env.OPENAI_API_KEY.substring(0, 20) + '...' + process.env.OPENAI_API_KEY.slice(-4) :
    'NOT SET');
console.log('BRAVE_API_KEY:', process.env.BRAVE_API_KEY ?
    process.env.BRAVE_API_KEY.substring(0, 10) + '...' + process.env.BRAVE_API_KEY.slice(-4) :
    'NOT SET');
console.log('Key length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0);