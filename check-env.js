import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

console.log('🔍 Checking environment variables...\n');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL || 'NOT SET');
console.log('ADMIN_PASSWORD:', process.env.ADMIN_PASSWORD || 'NOT SET');
console.log('JWT_ADMIN_SECRET:', process.env.JWT_ADMIN_SECRET ? 'SET' : 'NOT SET');
console.log('PORT:', process.env.PORT || 'NOT SET');
console.log('\n📁 .env file path:', join(__dirname, '.env'));
