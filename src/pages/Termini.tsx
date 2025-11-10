import React from 'react';
import { FileText, CheckCircle } from 'lucide-react';

const Termini = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          TERMINI DI SERVIZIO
        </h1>
        <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-8">
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Accettazione dei Termini</h2>
              <p>Utilizzando i nostri servizi, accetti questi termini e condizioni.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Servizi Offerti</h2>
              <p>Forniamo strumenti di trading, formazione e segnali per il mercato Forex e CFD.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. ResponsabilitÃ </h2>
              <p>Il trading comporta rischi. Non garantiamo profitti e non siamo responsabili per eventuali perdite.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Pagamenti</h2>
              <p>I pagamenti sono elaborati in modo sicuro. Le sottoscrizioni si rinnovano automaticamente.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Termini;
