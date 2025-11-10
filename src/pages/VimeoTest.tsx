import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const VimeoTest: React.FC = () => {
  const [vimeoId, setVimeoId] = useState('1073889359');
  const [testUrl, setTestUrl] = useState('');

  const testVideos = [
    { id: '1073889359', title: 'Il tuo video' },
    { id: '347119375', title: 'Video di test pubblico 1' },
    { id: '824804225', title: 'Video di test pubblico 2' },
  ];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <Link to="/admin/dashboard" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6">
          <ArrowLeft className="w-5 h-5" />
          Torna al pannello admin
        </Link>

        <h1 className="text-3xl font-bold mb-8">Test Player Vimeo</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Test con ID */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test con Vimeo ID</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Inserisci Vimeo ID:</label>
              <input
                type="text"
                value={vimeoId}
                onChange={(e) => setVimeoId(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
                placeholder="Es: 1073889359"
              />
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-400 mb-2">Video di test:</p>
              <div className="space-y-2">
                {testVideos.map((video) => (
                  <button
                    key={video.id}
                    onClick={() => setVimeoId(video.id)}
                    className="block w-full text-left px-3 py-2 bg-gray-800 rounded hover:bg-gray-700 text-sm"
                  >
                    {video.title}: {video.id}
                  </button>
                ))}
              </div>
            </div>

            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                className="w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Test Video"
              />
            </div>

            <div className="mt-4 p-3 bg-gray-800 rounded">
              <p className="text-xs text-gray-400">URL generato:</p>
              <code className="text-xs text-green-400">
                https://player.vimeo.com/video/{vimeoId}
              </code>
            </div>
          </div>

          {/* Test con URL completo */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Test con URL Completo</h2>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">Inserisci URL Vimeo completo:</label>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full px-3 py-2 bg-black border border-gray-700 rounded-lg text-white"
                placeholder="https://vimeo.com/1073889359"
              />
              <button
                onClick={() => {
                  // Estrai l'ID dall'URL
                  const match = testUrl.match(/vimeo\.com\/(\d+)/);
                  if (match) {
                    setVimeoId(match[1]);
                  }
                }}
                className="mt-2 px-4 py-2 bg-purple-600 rounded hover:bg-purple-500 text-sm"
              >
                Estrai ID e testa
              </button>
            </div>

            <div className="p-4 bg-gray-800 rounded">
              <h3 className="text-sm font-bold mb-2">Troubleshooting:</h3>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>✓ Il video deve essere pubblico o avere embedding abilitato</li>
                <li>✓ Per video privati, aggiungi localhost ai domini autorizzati</li>
                <li>✓ Verifica che l'ID sia solo numerico (es: 1073889359)</li>
                <li>✓ Non usare l'URL completo, solo l'ID</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-700 rounded">
              <h3 className="text-sm font-bold text-blue-400 mb-2">Come configurare Vimeo:</h3>
              <ol className="text-xs text-gray-300 space-y-1">
                <li>1. Vai su Vimeo.com e accedi</li>
                <li>2. Vai alle impostazioni del video</li>
                <li>3. Nella sezione "Privacy":</li>
                <li className="ml-4">• Seleziona "Pubblico" o "Non elencato"</li>
                <li className="ml-4">• O in "Embed" → "Specific domains"</li>
                <li className="ml-4">• Aggiungi: localhost:5173, localhost:5174</li>
                <li>4. Salva le modifiche</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Link diretto per verificare */}
        <div className="mt-8 p-6 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold mb-4">Link Diretti per Verificare:</h3>
          <div className="space-y-2">
            <a
              href={`https://vimeo.com/${vimeoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300"
            >
              → Apri video su Vimeo: https://vimeo.com/{vimeoId}
            </a>
            <a
              href={`https://player.vimeo.com/video/${vimeoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-blue-400 hover:text-blue-300"
            >
              → Apri player diretto: https://player.vimeo.com/video/{vimeoId}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VimeoTest;
