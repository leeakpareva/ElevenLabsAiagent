import fs from 'fs';

console.log('Reading .env file directly:');
const envContent = fs.readFileSync('.env', 'utf8');
console.log(envContent);

console.log('\nSystem environment:');
console.log('OPENAI_API_KEY from process.env (before dotenv):', process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET');

import dotenv from 'dotenv';
const result = dotenv.config();

console.log('\nDotenv result:', result);
console.log('OPENAI_API_KEY after dotenv:', process.env.OPENAI_API_KEY ?
    process.env.OPENAI_API_KEY.substring(0, 15) + '...' + process.env.OPENAI_API_KEY.slice(-4) :
    'NOT SET');