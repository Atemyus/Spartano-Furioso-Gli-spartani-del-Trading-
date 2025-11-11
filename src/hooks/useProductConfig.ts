import { useState, useEffect } from 'react';

interface ProductConfig {
  platforms?: string[];
  requirements?: {
    minDeposit?: number;
    leverage?: string;
    brokers?: string[];
  };
  features?: Record<string, boolean>;
}

export const useProductConfig = (productId: string | undefined) => {
  const [config, setConfig] = useState<ProductConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    const loadConfig = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://api.spartanofurioso.com/api/products/${productId}/config`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setConfig(data.config);
          }
        } else {
          setError('Failed to load product configuration');
        }
      } catch (err) {
        console.error('Error loading product config:', err);
        setError('Error loading configuration');
      } finally {
        setLoading(false);
      }
    };

    loadConfig();
  }, [productId]);

  return { config, loading, error };
};
