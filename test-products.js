// Test script to check products endpoints
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function testPublicProducts() {
  console.log('\n=== Testing Public Products Endpoint ===');
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();
    console.log(`Found ${products.length} active products:`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - €${p.price} (${p.type}) - Popular: ${p.popular || false} - Badge: ${p.badge || 'none'}`);
    });
    return products;
  } catch (error) {
    console.error('Error fetching public products:', error.message);
    return [];
  }
}

async function loginAdmin() {
  console.log('\n=== Admin Login ===');
  try {
    const response = await fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@tradingfalange.com',
        password: 'Admin123!@#'
      })
    });
    
    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Admin login successful!');
    return data.token;
  } catch (error) {
    console.error('Admin login error:', error.message);
    return null;
  }
}

async function testAdminProducts(token) {
  console.log('\n=== Testing Admin Products Endpoint ===');
  try {
    const response = await fetch(`${API_BASE}/admin/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch admin products: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`Found ${products.length} total products (including inactive):`);
    products.forEach((p, i) => {
      console.log(`${i + 1}. ${p.name} - €${p.price} - Active: ${p.active} - Popular: ${p.popular || false} - Badge: ${p.badge || 'none'}`);
    });
    return products;
  } catch (error) {
    console.error('Error fetching admin products:', error.message);
    return [];
  }
}

async function main() {
  console.log('Testing Products Synchronization...');
  
  // Test public products
  const publicProducts = await testPublicProducts();
  
  // Login as admin
  const adminToken = await loginAdmin();
  
  if (adminToken) {
    // Test admin products
    const adminProducts = await testAdminProducts(adminToken);
    
    // Compare
    console.log('\n=== Comparison ===');
    console.log(`Public endpoint: ${publicProducts.length} products`);
    console.log(`Admin endpoint: ${adminProducts.length} products`);
    
    if (adminProducts.length > publicProducts.length) {
      const inactiveCount = adminProducts.filter(p => !p.active).length;
      console.log(`${inactiveCount} products are inactive and not shown publicly`);
    }
  }
}

main().catch(console.error);
