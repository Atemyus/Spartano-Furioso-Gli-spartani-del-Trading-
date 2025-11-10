import React from 'react';
import { AlertTriangle, TrendingDown, Shield } from 'lucide-react';

const RiskDisclaimer = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          RISK DISCLAIMER
        </h1>
        <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-8">
          <div className="bg-red-900/20 border border-red-600 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-red-500">AVVISO IMPORTANTE</h2>
            </div>
            <p className="text-gray-300">Il trading di CFD e Forex comporta un alto livello di rischio e potrebbe non essere adatto a tutti gli investitori.</p>
          </div>
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Rischio di Perdita</h2>
              <p>Ãˆ possibile perdere tutto il capitale investito. Non investire denaro che non puoi permetterti di perdere.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Performance Passate</h2>
              <p>Le performance passate non sono indicative di risultati futuri.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Consulenza</h2>
              <p>I nostri servizi non costituiscono consulenza finanziaria personalizzata.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskDisclaimer;
