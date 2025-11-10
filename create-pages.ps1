# Script per creare tutte le pagine mancanti

# RISORSE Pages
@"
import React from 'react';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';

const Blog = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          BLOG DI GUERRA
        </h1>
        <p className="text-gray-300 mb-8">Strategie, analisi e storie dal campo di battaglia dei mercati</p>
        <div className="space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-white mb-2">Articolo di esempio {i}</h3>
              <p className="text-gray-400 mb-4">Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
              <a href="#" className="text-yellow-500 flex items-center gap-2 hover:text-yellow-400">
                Leggi di più <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
"@ | Out-File -FilePath "src\pages\Blog.tsx" -Encoding UTF8

@"
import React from 'react';
import { Video, PlayCircle, Youtube } from 'lucide-react';

const VideoTutorial = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          VIDEO TUTORIAL
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg overflow-hidden">
              <div className="bg-gray-800 h-40 flex items-center justify-center">
                <PlayCircle className="w-16 h-16 text-yellow-500" />
              </div>
              <div className="p-4">
                <h3 className="text-xl font-bold text-white mb-2">Tutorial {i}</h3>
                <p className="text-gray-400">Impara le strategie spartane</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoTutorial;
"@ | Out-File -FilePath "src\pages\VideoTutorial.tsx" -Encoding UTF8

@"
import React from 'react';
import { Mic, Headphones, Radio } from 'lucide-react';

const Podcast = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PODCAST SPARTANO
        </h1>
        <p className="text-gray-300 mb-8">Episodi settimanali con i migliori trader e analisti</p>
        <div className="space-y-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6 flex items-center gap-6">
              <Mic className="w-12 h-12 text-yellow-500" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">Episodio {i}: Trading Spartano</h3>
                <p className="text-gray-400">Durata: 45 min</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Ascolta</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Podcast;
"@ | Out-File -FilePath "src\pages\Podcast.tsx" -Encoding UTF8

@"
import React from 'react';
import { Book, Search } from 'lucide-react';

const Glossario = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          GLOSSARIO TRADING
        </h1>
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Cerca un termine..." className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-red-800/30 rounded-lg text-white" />
          </div>
        </div>
        <div className="space-y-4">
          {['Bull Market', 'Bear Market', 'Stop Loss', 'Take Profit', 'Leverage'].map(term => (
            <div key={term} className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-4">
              <h3 className="text-xl font-bold text-yellow-500 mb-2">{term}</h3>
              <p className="text-gray-400">Definizione del termine nel contesto del trading...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Glossario;
"@ | Out-File -FilePath "src\pages\Glossario.tsx" -Encoding UTF8

@"
import React from 'react';
import { Calculator, DollarSign, Percent } from 'lucide-react';

const Calcolatori = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          CALCOLATORI TRADING
        </h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Calculator className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Calcolatore Pip</h3>
            <p className="text-gray-400">Calcola il valore dei pip</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <DollarSign className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Size Position</h3>
            <p className="text-gray-400">Dimensiona le tue posizioni</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Percent className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Risk/Reward</h3>
            <p className="text-gray-400">Calcola il rapporto rischio/rendimento</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calcolatori;
"@ | Out-File -FilePath "src\pages\Calcolatori.tsx" -Encoding UTF8

# SUPPORTO Pages
@"
import React from 'react';
import { HelpCircle, MessageCircle, Book } from 'lucide-react';

const CentroAiuto = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          CENTRO AIUTO
        </h1>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <HelpCircle className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Guide Rapide</h3>
            <p className="text-gray-400">Tutorial e guide passo-passo</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <MessageCircle className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Chat Support</h3>
            <p className="text-gray-400">Assistenza in tempo reale</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Book className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Documentazione</h3>
            <p className="text-gray-400">Manuali e risorse complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CentroAiuto;
"@ | Out-File -FilePath "src\pages\CentroAiuto.tsx" -Encoding UTF8

@"
import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQ = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          FAQ GUERRIERI
        </h1>
        <div className="space-y-4 max-w-3xl mx-auto">
          {[
            'Come posso iniziare con Spartano Furioso?',
            'Quali sono i requisiti minimi?',
            'Posso provare prima di acquistare?',
            'Come funziona il supporto?',
            'Quali metodi di pagamento accettate?'
          ].map((question, i) => (
            <div key={i} className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">{question}</h3>
                <ChevronDown className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-gray-400 mt-3">Risposta dettagliata alla domanda...</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
"@ | Out-File -FilePath "src\pages\FAQ.tsx" -Encoding UTF8

@"
import React from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contatto = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          CONTATTO DIRETTO
        </h1>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Inviaci un messaggio</h2>
            <form className="space-y-4">
              <input type="text" placeholder="Nome" className="w-full p-3 bg-gray-900 border border-red-800/30 rounded-lg text-white" />
              <input type="email" placeholder="Email" className="w-full p-3 bg-gray-900 border border-red-800/30 rounded-lg text-white" />
              <textarea placeholder="Messaggio" rows={5} className="w-full p-3 bg-gray-900 border border-red-800/30 rounded-lg text-white"></textarea>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                Invia <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-6">Informazioni di contatto</h2>
            <div className="flex items-center gap-4">
              <Mail className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-300">info@spartanofurioso.com</span>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-300">+39 XXX XXX XXXX</span>
            </div>
            <div className="flex items-center gap-4">
              <MapPin className="w-6 h-6 text-yellow-500" />
              <span className="text-gray-300">Italia</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contatto;
"@ | Out-File -FilePath "src\pages\Contatto.tsx" -Encoding UTF8

@"
import React from 'react';
import { Handshake, Users, TrendingUp } from 'lucide-react';

const Partnership = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PARTNERSHIP
        </h1>
        <p className="text-gray-300 mb-12">Unisciti a noi come partner strategico</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Handshake className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Partner Tecnologici</h3>
            <p className="text-gray-400">Integrazione con piattaforme e broker</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Users className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Partner Educativi</h3>
            <p className="text-gray-400">Formazione e corsi congiunti</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <TrendingUp className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Partner Commerciali</h3>
            <p className="text-gray-400">Opportunità di business e crescita</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Partnership;
"@ | Out-File -FilePath "src\pages\Partnership.tsx" -Encoding UTF8

@"
import React from 'react';
import { DollarSign, Users, Gift } from 'lucide-react';

const Affiliazione = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PROGRAMMA AFFILIAZIONE
        </h1>
        <p className="text-gray-300 mb-12">Guadagna condividendo il successo spartano</p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <DollarSign className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Commissioni Alte</h3>
            <p className="text-gray-400">Fino al 50% di commissione ricorrente</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Users className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Supporto Dedicato</h3>
            <p className="text-gray-400">Team dedicato per il tuo successo</p>
          </div>
          <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-6">
            <Gift className="w-10 h-10 text-yellow-500 mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Bonus e Premi</h3>
            <p className="text-gray-400">Incentivi extra per top performer</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Affiliazione;
"@ | Out-File -FilePath "src\pages\Affiliazione.tsx" -Encoding UTF8

# LEGAL Pages
@"
import React from 'react';
import { Shield, Lock, Eye } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          PRIVACY POLICY
        </h1>
        <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-8">
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">1. Raccolta Dati</h2>
              <p>Raccogliamo solo i dati necessari per fornire i nostri servizi di trading e formazione.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">2. Uso dei Dati</h2>
              <p>I tuoi dati sono utilizzati esclusivamente per migliorare la tua esperienza di trading.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">3. Protezione</h2>
              <p>Utilizziamo le più moderne tecnologie di crittografia per proteggere i tuoi dati.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">4. Diritti dell'Utente</h2>
              <p>Hai il diritto di accedere, modificare o cancellare i tuoi dati in qualsiasi momento.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
"@ | Out-File -FilePath "src\pages\Privacy.tsx" -Encoding UTF8

@"
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
              <h2 className="text-2xl font-bold text-white mb-3">3. Responsabilità</h2>
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
"@ | Out-File -FilePath "src\pages\Termini.tsx" -Encoding UTF8

@"
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
              <p>È possibile perdere tutto il capitale investito. Non investire denaro che non puoi permetterti di perdere.</p>
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
"@ | Out-File -FilePath "src\pages\RiskDisclaimer.tsx" -Encoding UTF8

@"
import React from 'react';
import { Cookie, Settings, Shield } from 'lucide-react';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-black pt-24">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-5xl font-black mb-8 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
          COOKIE POLICY
        </h1>
        <div className="bg-gradient-to-b from-gray-900 to-black border border-red-800/30 rounded-lg p-8">
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Cosa sono i Cookie</h2>
              <p>I cookie sono piccoli file di testo salvati sul tuo dispositivo per migliorare l'esperienza utente.</p>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Cookie Utilizzati</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Cookie tecnici necessari</li>
                <li>Cookie di analisi per migliorare i servizi</li>
                <li>Cookie di preferenza per ricordare le tue scelte</li>
              </ul>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-white mb-3">Gestione Cookie</h2>
              <p>Puoi gestire o disabilitare i cookie dalle impostazioni del tuo browser.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
"@ | Out-File -FilePath "src\pages\CookiePolicy.tsx" -Encoding UTF8

Write-Host "Tutte le pagine sono state create con successo!" -ForegroundColor Green
