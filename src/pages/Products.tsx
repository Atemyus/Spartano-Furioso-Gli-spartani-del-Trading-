import React from 'react';
import ProductsSection from '../components/ProductsSection';
import { useTheme } from '../contexts/ThemeContext';

const Products: React.FC = () => {
  const { theme } = useTheme();
  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen ${dark ? 'bg-black' : 'bg-slate-50'}`}>
      {/* Il global Header del sito gia' fornisce navigazione + Dashboard + Logout */}
      <ProductsSection />
    </div>
  );
};

export default Products;
