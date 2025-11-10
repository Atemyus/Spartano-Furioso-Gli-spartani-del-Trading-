import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import LaFalange from '../components/LaFalange';
import LAddestramento from '../components/LAddestramento';
import ProductsSection from '../components/ProductsSection';
import Testimonials from '../components/Testimonials';
import Community from '../components/Community';
// import TestStripe from '../components/TestStripe'; // Rimosso dopo test

const Home: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Scroll alla sezione se specificata nello state
    const state = location.state as { scrollTo?: string } | null;
    const scrollTo = state?.scrollTo;
    if (scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100); // Piccolo delay per assicurarsi che la pagina sia renderizzata
    }
  }, [location]);

  return (
    <>
      <Hero />
      {/* <TestDataFetch /> Uncommenta per debug */}
      <div id="falange">
        <LaFalange />
      </div>
      <div id="addestramento">
        <LAddestramento />
      </div>
      <ProductsSection />
      <div id="veterani">
        <Testimonials />
      </div>
      <div id="community">
        <Community />
      </div>
    </>
  );
};

export default Home;
