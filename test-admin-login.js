// Script di test per verificare il login admin
import fetch from 'node-fetch';

const testAdminLogin = async () => {
  console.log('🔄 Testing admin login endpoint...\n');
  
  const credentials = {
    email: 'admin@tradingfalange.com',
    password: 'Admin123!@#'
  };

  try {
    console.log('📧 Email:', credentials.email);
    console.log('🔑 Password:', credentials.password);
    console.log('\n📡 Sending request to: http://localhost:3001/api/auth/admin/login\n');

    const response = await fetch('http://localhost:3001/api/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();
    
    console.log('📥 Response status:', response.status);
    console.log('📦 Response data:', JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Login successful!');
      console.log('🎫 Token received:', data.token ? 'Yes' : 'No');
      console.log('👤 Admin data:', data.admin);
    } else {
      console.log('\n❌ Login failed!');
      console.log('Error:', data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('\n🚨 Connection error:', error.message);
    console.log('Make sure the backend server is running on port 3001');
  }
};

// Run the test
testAdminLogin();
