// Utility function to fix all products and make them active
export const fixAllProducts = async () => {
  try {
    // First, get the admin token (you need to be logged in as admin)
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      console.error('You need to be logged in as admin');
      return false;
    }

    // Call the fix endpoint
    const response = await fetch('http://localhost:3001/api/admin/products/fix-active', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fix products');
    }

    const result = await response.json();
    console.log('Products fixed:', result);
    
    // Reload the page to see the changes
    window.location.reload();
    return true;
  } catch (error) {
    console.error('Error fixing products:', error);
    return false;
  }
};

// Function to manually activate products without admin token (for emergency)
export const emergencyFixProducts = async () => {
  try {
    // Get all products
    const response = await fetch('http://localhost:3001/api/products');
    const products = await response.json();
    
    console.log('Current products status:');
    products.forEach((p: any) => {
      console.log(`- ${p.name}: active=${p.active}`);
    });
    
    // If no products are active, we have a problem
    const activeProducts = products.filter((p: any) => p.active === true);
    if (activeProducts.length === 0) {
      console.error('WARNING: No active products found!');
      console.log('To fix this, you need to:');
      console.log('1. Login to admin panel');
      console.log('2. Run fixAllProducts() in the browser console');
    }
    
    return products;
  } catch (error) {
    console.error('Error checking products:', error);
    return [];
  }
};

// Function to restore complete product data (pricing plans, requirements, platforms)
export const restoreProductData = async () => {
  try {
    // First, get the admin token (you need to be logged in as admin)
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      console.error('You need to be logged in as admin');
      console.log('Please login at /admin/login first');
      return false;
    }

    console.log('Restoring product data...');
    
    // Call the restore endpoint
    const response = await fetch('http://localhost:3001/api/admin/products/restore-data', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to restore products');
    }

    const result = await response.json();
    console.log('✅ Products restored:', result);
    console.log(`Updated ${result.updated} products`);
    
    // Reload the page to see the changes
    setTimeout(() => {
      console.log('Reloading page...');
      window.location.reload();
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error restoring products:', error);
    return false;
  }
};

// Export to window for easy access in browser console
if (typeof window !== 'undefined') {
  (window as any).fixAllProducts = fixAllProducts;
  (window as any).checkProducts = emergencyFixProducts;
  (window as any).restoreProductData = restoreProductData;
  
  console.log('🛠️ Product Fix Utilities Loaded!');
  console.log('Available commands:');
  console.log('  - checkProducts() : Check product status');
  console.log('  - fixAllProducts() : Make all products active');
  console.log('  - restoreProductData() : Restore pricing plans, requirements, and platforms');
}
