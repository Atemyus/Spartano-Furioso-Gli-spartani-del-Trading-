import React, { useEffect, useState } from 'react';

const TestDataFetch: React.FC = () => {
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTestData = async () => {
      try {
        // Test fetching product list
        const response = await fetch('http://localhost:3001/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        const products = await response.json();
        
        console.log('=== TEST DATA FETCH ===');
        console.log('Total products:', products.length);
        
        if (products.length > 0) {
          const firstProduct = products[0];
          console.log('First product:', firstProduct);
          console.log('Has pricingPlans?', !!firstProduct.pricingPlans);
          console.log('PricingPlans:', firstProduct.pricingPlans);
          console.log('Has requirements?', !!firstProduct.requirements);
          console.log('Requirements:', firstProduct.requirements);
          console.log('Has platforms?', !!firstProduct.platforms);
          console.log('Platforms:', firstProduct.platforms);
          
          setProductData(firstProduct);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching test data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchTestData();
  }, []);

  if (loading) return <div>Loading test data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!productData) return <div>No products found</div>;

  return (
    <div style={{ padding: '20px', background: '#1a1a1a', color: 'white', margin: '20px' }}>
      <h2>Test Data Fetch Results</h2>
      <pre style={{ background: '#333', padding: '10px', overflow: 'auto' }}>
        {JSON.stringify({
          name: productData.name,
          hasPricingPlans: !!productData.pricingPlans,
          pricingPlansKeys: productData.pricingPlans ? Object.keys(productData.pricingPlans) : [],
          hasRequirements: !!productData.requirements,
          requirementsCount: productData.requirements?.length || 0,
          hasPlatforms: !!productData.platforms,
          platformsCount: productData.platforms?.length || 0
        }, null, 2)}
      </pre>
      <details>
        <summary>Full Product Data (Click to expand)</summary>
        <pre style={{ background: '#333', padding: '10px', overflow: 'auto' }}>
          {JSON.stringify(productData, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TestDataFetch;
