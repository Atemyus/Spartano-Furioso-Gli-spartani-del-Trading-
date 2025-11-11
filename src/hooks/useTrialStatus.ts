import { useState, useEffect } from 'react';

interface TrialStatus {
  hasTrial: boolean;
  isActive: boolean;
  hasExpired: boolean;
  endDate?: string;
  daysRemaining?: number;
  loading: boolean;
  error?: string;
}

export const useTrialStatus = (productId: string): TrialStatus => {
  const [status, setStatus] = useState<TrialStatus>({
    hasTrial: false,
    isActive: false,
    hasExpired: false,
    loading: true,
    error: undefined
  });

  useEffect(() => {
    const checkTrialStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          setStatus({
            hasTrial: false,
            isActive: false,
            hasExpired: false,
            loading: false
          });
          return;
        }

        const response = await fetch(`https://api.spartanofurioso.com/api/products/trial-status/${productId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.hasTrial && data.trial) {
            const endDate = new Date(data.trial.endDate);
            const now = new Date();
            const isActive = now < endDate;
            const hasExpired = data.hasTrial && !isActive;
            const daysRemaining = isActive ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;
            
            setStatus({
              hasTrial: true,
              isActive,
              hasExpired,
              endDate: data.trial.endDate,
              daysRemaining,
              loading: false
            });
          } else {
            setStatus({
              hasTrial: false,
              isActive: false,
              hasExpired: false,
              loading: false
            });
          }
        } else {
          setStatus({
            hasTrial: false,
            isActive: false,
            hasExpired: false,
            loading: false,
            error: 'Failed to check trial status'
          });
        }
      } catch (error) {
        console.error('Error checking trial status:', error);
        setStatus({
          hasTrial: false,
          isActive: false,
          hasExpired: false,
          loading: false,
          error: 'Error checking trial status'
        });
      }
    };

    if (productId) {
      checkTrialStatus();
    }
  }, [productId]);

  return status;
};
