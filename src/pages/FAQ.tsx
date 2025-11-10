import { useState } from 'react';
import { HelpCircle, ChevronDown, Search, Shield, DollarSign, Users, Zap, BookOpen, CreditCard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const FAQ = () => {
  const { theme } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      category: "Iniziare",
      icon: Shield,
      questions: [
        {
          q: "Come posso iniziare con Spartano Furioso?",
          a: "Iniziare è semplice! 1) Registrati gratuitamente sul sito. 2) Verifica la tua email. 3) Completa il tuo profilo. 4) Scegli un piano o attiva una prova gratuita. 5) Accedi alla dashboard e inizia il tuo percorso spartano. Il nostro team di supporto è disponibile 24/7 per guidarti nei primi passi."
        },
        {
          q: "Quali sono i requisiti minimi per iniziare?",
          a: "Requisiti minimi: capitale minimo consigliato €500-1000, connessione internet stabile, computer o smartphone, età minima 18 anni, documento d'identità per verifica. Non serve esperienza pregressa - i nostri corsi partono dalle basi!"
        },
        {
          q: "Posso provare prima di acquistare?",
          a: "Assolutamente sì! Offriamo una prova gratuita di 7 giorni per tutti i nostri servizi premium. Accesso completo a segnali, trading room, corsi base e strumenti. Nessuna carta di credito richiesta per la prova. Dopo 7 giorni puoi decidere se continuare o no."
        }
      ]
    },
    {
      category: "Pagamenti",
      icon: CreditCard,
      questions: [
        {
          q: "Quali metodi di pagamento accettate?",
          a: "Accettiamo: Carte di credito/debito (Visa, Mastercard, American Express), PayPal, Bonifico bancario (SEPA), Criptovalute (Bitcoin, Ethereum, USDT), Apple Pay e Google Pay. Tutti i pagamenti sono protetti con crittografia SSL a 256-bit."
        },
        {
          q: "Posso ottenere un rimborso?",
          a: "Sì! Offriamo una garanzia soddisfatti o rimborsati di 30 giorni. Se non sei soddisfatto del servizio, contatta il supporto entro 30 giorni dall'acquisto per un rimborso completo, senza domande. Il rimborso viene processato entro 5-7 giorni lavorativi."
        },
        {
          q: "I prezzi includono IVA?",
          a: "I prezzi mostrati sono IVA inclusa per clienti UE. Per clienti extra-UE, l'IVA non viene applicata. La fattura viene generata automaticamente e inviata via email dopo ogni pagamento. Puoi scaricare tutte le tue fatture dalla dashboard."
        }
      ]
    },
    {
      category: "Supporto",
      icon: Users,
      questions: [
        {
          q: "Come funziona il supporto?",
          a: "Supporto multicanale disponibile 24/7: Live chat (risposta media 2 minuti), Email (risposta entro 24h), Telefono (Lun-Ven 9-18), Discord community con moderatori sempre attivi, Centro aiuto con oltre 200 guide. Il supporto è in italiano e inglese."
        },
        {
          q: "Posso parlare con un trader esperto?",
          a: "Sì! Gli abbonati premium hanno accesso a sessioni 1-on-1 con i nostri trader professionisti. Puoi prenotare una call di 30 minuti tramite la dashboard. Inoltre, nelle sessioni live della trading room puoi fare domande direttamente ai nostri analisti."
        },
        {
          q: "C'è una community di trader?",
          a: "Assolutamente! Abbiamo una community Discord con oltre 10,000 membri attivi. Canali dedicati per ogni asset class, chat italiana, mentorship, condivisione strategie, e eventi settimanali. La community è moderata 24/7 per garantire un ambiente professionale."
        }
      ]
    },
    {
      category: "Servizi",
      icon: Zap,
      questions: [
        {
          q: "Cosa include l'abbonamento premium?",
          a: "L'abbonamento premium include: Segnali di trading illimitati (10-20 al giorno), Accesso completo alla trading room, Tutti i corsi di formazione, Strumenti e calcolatori avanzati, Analisi giornaliere e report settimanali, Supporto prioritario, Community Discord premium, Webinar esclusivi mensili."
        },
        {
          q: "I segnali sono garantiti?",
          a: "I segnali sono basati su analisi professionali con win rate storico del 74%, ma il trading comporta sempre rischi. Non possiamo garantire profitti. Pubblichiamo tutte le performance in modo trasparente. Ogni segnale include risk management dettagliato. Consigliamo sempre di non rischiare più del 2% per trade."
        },
        {
          q: "Posso cancellare l'abbonamento in qualsiasi momento?",
          a: "Sì, puoi cancellare in qualsiasi momento dalla dashboard, senza penali. L'accesso rimane attivo fino alla fine del periodo già pagato. Non ci sono rinnovi automatici nascosti - ricevi sempre un promemoria 7 giorni prima del rinnovo. Puoi riattivare l'abbonamento quando vuoi."
        }
      ]
    },
    {
      category: "Formazione",
      icon: BookOpen,
      questions: [
        {
          q: "I corsi sono adatti ai principianti?",
          a: "Assolutamente! Il Corso Base parte da zero: cos'è il trading, come funzionano i mercati, terminologia, piattaforme, prime strategie. Procediamo step-by-step con video, quiz ed esercizi pratici. Oltre il 60% dei nostri studenti parte da zero esperienza."
        },
        {
          q: "Quanto tempo serve per completare un corso?",
          a: "Dipende dal corso: Corso Base (6 settimane, 2-3 ore/settimana), Corso Avanzato (8 settimane, 3-4 ore/settimana), Master Trading (12 settimane, 4-5 ore/settimana). Puoi andare al tuo ritmo - i corsi restano accessibili a vita. Include replay di tutte le lezioni."
        },
        {
          q: "Ricevo un certificato alla fine?",
          a: "Sì! Dopo aver completato un corso e superato l'esame finale (70% minimo), ricevi un certificato digitale verificabile. Il certificato include: nome del corso, data completamento, voto finale, QR code di verifica. Puoi condividerlo su LinkedIn o nel tuo CV."
        }
      ]
    }
  ];

  const allQuestions = faqCategories.flatMap((cat, catIndex) => 
    cat.questions.map((q, qIndex) => ({
      ...q,
      category: cat.category,
      icon: cat.icon,
      globalIndex: catIndex * 100 + qIndex
    }))
  );

  const filteredQuestions = searchTerm
    ? allQuestions.filter(item => 
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : allQuestions;

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-600 to-yellow-600 rounded-2xl mb-6 animate-pulse">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600 bg-clip-text text-transparent">
            FAQ GUERRIERI
          </h1>
          <p className={`text-xl max-w-3xl mx-auto ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-300'
          }`}>
            Risposte alle domande più frequenti. Se non trovi quello che cerchi, 
            il nostro supporto è sempre disponibile 24/7.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cerca una domanda... (es. pagamento, rimborso, corso)"
              className={`w-full pl-12 pr-4 py-4 border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                theme === 'light'
                  ? 'bg-white border-gray-300 text-gray-800 placeholder-gray-400 focus:border-yellow-600'
                  : 'bg-gray-900 border-red-800/30 text-white placeholder-gray-500 focus:border-yellow-500'
              }`}
            />
          </div>
          {searchTerm && (
            <p className={`text-sm mt-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>
              Trovate {filteredQuestions.length} domande
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 max-w-4xl mx-auto">
          {[
            { label: 'Domande', value: allQuestions.length.toString() },
            { label: 'Categorie', value: faqCategories.length.toString() },
            { label: 'Tempo Risposta', value: '<2min' },
            { label: 'Soddisfazione Clienti', value: '95%' }
          ].map((stat, i) => (
            <div key={i} className={`rounded-lg p-4 text-center transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-yellow-600 shadow-md'
                : 'bg-gradient-to-b from-gray-900 to-black border border-red-800/30 hover:border-yellow-500/50'
            }`}>
              <div className="text-2xl font-black text-yellow-500">{stat.value}</div>
              <div className={`text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-4xl mx-auto space-y-4">
          {filteredQuestions.map((item, index) => {
            const isOpen = openIndex === item.globalIndex;
            const Icon = item.icon;
            
            return (
              <div
                key={item.globalIndex}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  theme === 'light'
                    ? isOpen
                      ? 'bg-white border-2 border-yellow-600 shadow-lg'
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    : isOpen
                      ? 'bg-gradient-to-b from-gray-900 to-black border-yellow-500 shadow-lg shadow-yellow-500/20'
                      : 'bg-gradient-to-b from-gray-900 to-black border-red-800/30 hover:border-red-700/50'
                }`}
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : item.globalIndex)}
                  className="w-full p-6 text-left flex items-start gap-4 group"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-gradient-to-br from-red-600 to-yellow-600' : 'bg-gray-800 group-hover:bg-gray-700'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors ${isOpen ? 'text-white' : 'text-gray-400 group-hover:text-yellow-500'}`} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        isOpen ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-800 text-gray-500'
                      }`}>
                        {item.category}
                      </span>
                    </div>
                    <h3 className={`text-lg font-bold transition-colors ${
                      isOpen
                        ? 'text-yellow-500'
                        : theme === 'light'
                          ? 'text-gray-800 group-hover:text-yellow-600'
                          : 'text-white group-hover:text-yellow-500'
                    }`}>
                      {item.q}
                    </h3>
                  </div>
                  
                  <ChevronDown 
                    className={`flex-shrink-0 w-6 h-6 text-yellow-500 transition-transform duration-300 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-6 pb-6 pl-20">
                    <p className={`leading-relaxed ${
                      theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {searchTerm && filteredQuestions.length === 0 && (
          <div className="text-center py-12">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
              theme === 'light' ? 'bg-gray-200' : 'bg-gray-900'
            }`}>
              <Search className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${
              theme === 'light' ? 'text-gray-800' : 'text-white'
            }`}>Nessun risultato trovato</h3>
            <p className={`mb-6 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
            }`}>Prova con parole chiave diverse o contatta il supporto</p>
            <button className={`px-6 py-3 bg-gradient-to-r from-red-600 to-red-800 text-white rounded-xl font-bold hover:scale-105 transition-transform border-2 ${theme === 'light' ? 'border-red-900 shadow-lg' : 'border-transparent'}`}>
              Contatta il Supporto
            </button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">Non hai trovato la risposta?</h2>
          <p className="text-gray-100 mb-6">Il nostro team di supporto è pronto ad aiutarti 24/7</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className={`px-8 py-4 bg-black text-yellow-500 rounded-xl font-bold text-lg hover:bg-gray-900 transition-all duration-300 hover:scale-105 border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>
              Apri Live Chat
            </button>
            <button className={`px-8 py-4 bg-white/10 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 border-2 ${theme === 'light' ? 'border-white/30' : 'border-transparent'}`}>
              Invia Email
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default FAQ;
