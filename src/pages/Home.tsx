import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import LaFalange from '../components/LaFalange';
import LAddestramento from '../components/LAddestramento';
import ProductsSection from '../components/ProductsSection';
import Testimonials from '../components/Testimonials';
import Community from '../components/Community';
import ScrollReveal from '../components/ScrollReveal';

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
      <ScrollReveal as="div" distance={32}>
        <div id="falange"><LaFalange /></div>
      </ScrollReveal>
      <ScrollReveal as="div" distance={32}>
        <div id="addestramento"><LAddestramento /></div>
      </ScrollReveal>
      <ScrollReveal as="div" distance={32}>
        <ProductsSection />
      </ScrollReveal>
      <ScrollReveal as="div" distance={32}>
        <div id="veterani"><Testimonials /></div>
      </ScrollReveal>
      <ScrollReveal as="div" distance={32}>
        <div id="community"><Community /></div>
      </ScrollReveal>
    </>
  );
};

export default Home;
