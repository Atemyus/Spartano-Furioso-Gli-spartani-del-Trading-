import { useEffect, useState } from 'react';
import { Atom, Beaker } from 'lucide-react';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

const LoadingScreen = ({ onLoadingComplete }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'fadeout'>('loading');

  useEffect(() => {
    // Simula il caricamento progressivo
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setPhase('ready');
          setTimeout(() => {
            setPhase('fadeout');
            setTimeout(onLoadingComplete, 800);
          }, 500);
          return 100;
        }
        // Accelerazione progressiva
        const increment = prev < 30 ? 2 : prev < 70 ? 5 : 10;
        return Math.min(prev + increment, 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex items-center justify-center transition-opacity duration-800 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-900/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyMjAsMzgsMzgsMC4xKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo Animation */}
        <div className="relative mb-12">
          {/* Outer Ring */}
          <div className="absolute inset-0 w-40 h-40 -m-8">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient1)"
                strokeWidth="2"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * progress) / 100}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#06b6d4" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Lab Icon Container */}
          <div className="relative w-24 h-24 bg-gradient-to-br from-blue-950 to-black rounded-2xl flex items-center justify-center border border-cyan-500/30 shadow-2xl shadow-cyan-500/20">
            <div className="relative">
              <Atom
                className="w-12 h-12 text-cyan-400"
                style={{
                  filter: 'drop-shadow(0 0 10px rgba(34, 211, 238, 0.6))',
                  animation: 'spin-slow 6s linear infinite'
                }}
              />
              <Beaker
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-400 animate-pulse"
                style={{ animationDelay: '0.5s' }}
              />
            </div>
          </div>
        </div>

        {/* Brand Name */}
        <div className="text-center mb-8">
          <h1 className="font-display text-5xl md:text-6xl font-bold mb-2 tracking-tight">
            <span
              className="inline-block bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 bg-clip-text text-transparent animate-gradient"
              style={{
                backgroundSize: '200% auto',
                animation: 'gradient 3s linear infinite'
              }}
            >
              NEXORA
            </span>
            <span className="text-white ml-3">LAB</span>
          </h1>
          <p className="font-mono-lab text-cyan-400 text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-500"></span>
            </span>
            booting modern income engine
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-80 max-w-md">
          <div className="relative h-2 bg-gray-900 rounded-full overflow-hidden border border-blue-900/30">
            {/* Progress Fill */}
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                backgroundSize: '200% 100%',
                animation: 'gradient 2s linear infinite'
              }}
            >
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
            </div>
          </div>
          
          {/* Progress Text */}
          <div className="flex justify-between items-center mt-3">
            <span className="font-mono-lab text-slate-400 text-xs tracking-widest uppercase">
              {phase === 'ready' ? '// ready' : '// loading'}
            </span>
            <span className="font-mono-lab text-cyan-400 text-xs font-medium tabular-nums tracking-widest">
              {progress.toString().padStart(3, '0')}%
            </span>
          </div>
        </div>

        {/* Loading Messages */}
        <div className="mt-8 h-6">
          {progress < 30 && (
            <p className="font-mono-lab text-slate-500 text-xs tracking-widest uppercase animate-pulse">
              {`// initializing trading modules`}
            </p>
          )}
          {progress >= 30 && progress < 60 && (
            <p className="font-mono-lab text-slate-500 text-xs tracking-widest uppercase animate-pulse">
              {`// loading creator studio`}
            </p>
          )}
          {progress >= 60 && progress < 90 && (
            <p className="font-mono-lab text-slate-500 text-xs tracking-widest uppercase animate-pulse">
              {`// syncing community signals`}
            </p>
          )}
          {progress >= 90 && progress < 100 && (
            <p className="font-mono-lab text-slate-500 text-xs tracking-widest uppercase animate-pulse">
              {`// finalizing lab environment`}
            </p>
          )}
          {progress === 100 && (
            <p className="font-mono-lab text-cyan-400 text-xs font-medium tracking-widest uppercase">
              {`// lab ready · welcome`}
            </p>
          )}
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-gradient {
          background-size: 200% auto;
          animation: gradient 3s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
