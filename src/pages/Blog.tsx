import { BookOpen, Calendar, ArrowRight, User, Clock, Tag, TrendingUp } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Blog = () => {
  const { theme } = useTheme();
  const blogPosts = [
    {
      title: "Disciplina nel Trading: Come Dominare le Emozioni",
      excerpt: "Scopri come applicare il metodo Nexora Lab per controllare paura e avidità nei mercati.",
      category: "Psicologia",
      date: "15 Gen 2025",
      readTime: "8 min",
      author: "Marco Bianchi"
    },
    {
      title: "Risk Management: Proteggi il Tuo Capitale con Metodo",
      excerpt: "Le 5 regole d'oro per la gestione del rischio e come calcolare il position sizing perfetto.",
      category: "Risk Management",
      date: "12 Gen 2025",
      readTime: "10 min",
      author: "Sofia Conti"
    },
    {
      title: "Pattern Price Action: I Segreti dei Trader Professionisti",
      excerpt: "Guida completa ai pattern di price action più profittevoli e come tradare ognuno con precisione.",
      category: "Analisi Tecnica",
      date: "10 Gen 2025",
      readTime: "12 min",
      author: "Luca Ferrari"
    },
    {
      title: "Backtesting: Come Testare le Tue Strategie con Rigore",
      excerpt: "Metodologia completa per backtestare strategie di trading ed evitare gli errori comuni.",
      category: "Strategie",
      date: "8 Gen 2025",
      readTime: "15 min",
      author: "Alessandro Romano"
    }
  ];

  return (
    <div className={`min-h-screen pt-24 ${
      theme === 'light' ? 'bg-gradient-to-b from-white via-gray-50 to-white' : 'bg-black'
    }`}>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <span className="font-mono-lab text-xs text-cyan-400 tracking-[0.3em] uppercase">// Blog</span>
          <h1 className={`font-display text-5xl md:text-6xl font-bold mt-2 mb-4 tracking-tight ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">Lab</span> notes
          </h1>
          <p className={`text-lg md:text-xl max-w-3xl mx-auto leading-relaxed ${
            theme === 'light' ? 'text-slate-600' : 'text-slate-300'
          }`}>
            Strategie, analisi, framework operativi. Contenuti pratici scritti da chi opera ogni giorno
            nei mercati e nella creator economy.
          </p>
        </div>

        {/* Featured Post */}
        <div className={`rounded-2xl p-8 mb-12 ${
          theme === 'light'
            ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-2 border-gray-200'
            : 'bg-gradient-to-r from-blue-950/50 via-black/50 to-blue-950/50 backdrop-blur-sm border border-blue-800/30'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-cyan-500" />
            <span className="text-cyan-500 font-bold text-sm uppercase">In Evidenza</span>
          </div>
          <h2 className={`text-3xl font-black mb-4 ${
            theme === 'light' ? 'text-gray-800' : 'text-white'
          }`}>{blogPosts[0].title}</h2>
          <p className={`mb-6 text-lg ${
            theme === 'light' ? 'text-gray-700' : 'text-gray-300'
          }`}>{blogPosts[0].excerpt}</p>
          <div className={`flex flex-wrap items-center gap-4 text-sm mb-6 ${
            theme === 'light' ? 'text-gray-600' : 'text-gray-400'
          }`}>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blogPosts[0].author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{blogPosts[0].date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{blogPosts[0].readTime}</span>
            </div>
          </div>
          <button className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2 border-2 ${theme === 'light' ? 'border-blue-900 shadow-lg' : 'border-transparent'}`}>
            Leggi l'Articolo <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Blog Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.slice(1).map((post, i) => (
            <div key={i} className={`rounded-xl p-6 transition-all duration-300 ${
              theme === 'light'
                ? 'bg-white border-2 border-gray-200 hover:border-cyan-600 shadow-lg'
                : 'bg-gradient-to-b from-gray-900 to-black border border-blue-800/30 hover:border-cyan-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-cyan-500" />
                <span className="text-xs font-bold text-cyan-500 uppercase">{post.category}</span>
              </div>
              <h3 className={`text-xl font-bold mb-3 ${
                theme === 'light' ? 'text-gray-800' : 'text-white'
              }`}>{post.title}</h3>
              <p className={`mb-4 text-sm ${
                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
              }`}>{post.excerpt}</p>
              <div className={`flex items-center justify-between text-xs mb-4 ${
                theme === 'light' ? 'text-gray-500' : 'text-gray-500'
              }`}>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  <span>{post.readTime}</span>
                </div>
              </div>
              <button className={`w-full py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-2 border-2 ${
                theme === 'light'
                  ? 'bg-cyan-500 text-white hover:bg-cyan-600 border-cyan-700 shadow-md'
                  : 'bg-gray-800 text-white hover:bg-blue-600 border-transparent'
              }`}>
                Leggi <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-8 text-center">
          <BookOpen className="w-12 h-12 text-white mx-auto mb-4" />
          <h2 className="text-3xl font-black text-white mb-4">Iscriviti alla Newsletter</h2>
          <p className="text-gray-100 mb-6">Ricevi i nuovi articoli direttamente nella tua inbox</p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input type="email" placeholder="La tua email" className="flex-1 px-4 py-3 bg-black/50 border border-white/30 rounded-xl text-white placeholder-gray-400 focus:outline-none" />
            <button className={`px-6 py-3 bg-black text-cyan-500 rounded-xl font-bold hover:bg-gray-900 transition-all hover:scale-105 active:scale-95 border-2 ${theme === 'light' ? 'border-gray-900 shadow-lg' : 'border-transparent'}`}>ISCRIVITI</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
