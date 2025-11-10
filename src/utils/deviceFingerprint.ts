// Device Fingerprinting Library
// Raccoglie informazioni uniche del dispositivo per prevenire abusi

interface DeviceFingerprint {
  userAgent: string;
  screenResolution: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  timezone: string;
  timezoneOffset: number;
  language: string;
  languages: string[];
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  plugins: string[];
  fonts: string[];
  canvas: string;
  webgl: {
    vendor: string;
    renderer: string;
  };
  audio: string;
  touchSupport: {
    maxTouchPoints: number;
    touchEvent: boolean;
    touchStart: boolean;
  };
  cookies: boolean;
  localStorage: boolean;
  sessionStorage: boolean;
  indexedDB: boolean;
  webdriver: boolean;
  doNotTrack: string | null;
  adBlock: boolean;
}

// Genera un fingerprint del canvas
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';
    
    // Testo con font e stili specifici
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    
    ctx.fillStyle = '#069';
    ctx.font = '11pt no-real-font-123';
    ctx.fillText('Canvas fingerprint €🎨', 2, 15);
    
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText('BrowserFingerprint', 4, 45);
    
    // Forme geometriche
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath();
    ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgb(255,255,0)';
    ctx.beginPath();
    ctx.arc(75, 100, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    // Converti in stringa base64
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}

// Ottieni informazioni WebGL
function getWebGLFingerprint(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { vendor: '', renderer: '' };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) {
      return { vendor: '', renderer: '' };
    }
    
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '',
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''
    };
  } catch (e) {
    return { vendor: '', renderer: '' };
  }
}

// Genera fingerprint audio
function getAudioFingerprint(): string {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return '';
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);
    
    let fingerprint = '';
    scriptProcessor.onaudioprocess = function(event) {
      const output = event.inputBuffer.getChannelData(0);
      fingerprint = output.slice(0, 100).toString();
    };
    
    oscillator.start(0);
    oscillator.stop(0.1);
    
    setTimeout(() => {
      scriptProcessor.disconnect();
      gainNode.disconnect();
      analyser.disconnect();
      oscillator.disconnect();
      context.close();
    }, 100);
    
    return fingerprint;
  } catch (e) {
    return '';
  }
}

// Rileva font installati
function getInstalledFonts(): string[] {
  const baseFonts = ['monospace', 'sans-serif', 'serif'];
  const testFonts = [
    'Arial', 'Arial Black', 'Arial Narrow', 'Arial Rounded MT Bold',
    'Bookman Old Style', 'Bradley Hand ITC', 'Century', 'Century Gothic',
    'Comic Sans MS', 'Courier', 'Courier New', 'Georgia', 'Gentium',
    'Impact', 'Lucida Console', 'Palatino Linotype', 'Papyrus',
    'Tahoma', 'Times', 'Times New Roman', 'Trebuchet MS', 'Verdana'
  ];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  
  const text = 'mmmmmmmmmmlli';
  const textSize = '72px';
  
  const baseFontWidths: { [key: string]: number } = {};
  
  // Misura larghezza con font base
  baseFonts.forEach(baseFont => {
    ctx.font = `${textSize} ${baseFont}`;
    baseFontWidths[baseFont] = ctx.measureText(text).width;
  });
  
  const detectedFonts: string[] = [];
  
  // Controlla ogni font
  testFonts.forEach(font => {
    let detected = false;
    
    baseFonts.forEach(baseFont => {
      ctx.font = `${textSize} ${font}, ${baseFont}`;
      const width = ctx.measureText(text).width;
      
      if (width !== baseFontWidths[baseFont]) {
        detected = true;
      }
    });
    
    if (detected) {
      detectedFonts.push(font);
    }
  });
  
  return detectedFonts;
}

// Rileva se AdBlock è attivo
async function detectAdBlock(): Promise<boolean> {
  return new Promise((resolve) => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads text-ad-links ad-text adSense adBlock adContent adBanner';
    testAd.style.position = 'absolute';
    testAd.style.left = '-9999px';
    testAd.style.width = '1px';
    testAd.style.height = '1px';
    
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const adBlocked = testAd.offsetHeight === 0 || 
                       testAd.offsetWidth === 0 || 
                       testAd.clientHeight === 0 || 
                       testAd.clientWidth === 0;
      
      document.body.removeChild(testAd);
      resolve(adBlocked);
    }, 100);
  });
}

// Funzione principale per generare il fingerprint
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    // Browser info
    userAgent: navigator.userAgent,
    
    // Screen info
    screenResolution: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1
    },
    
    // Timezone
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    
    // Language
    language: navigator.language,
    languages: navigator.languages ? [...navigator.languages] : [navigator.language],
    
    // Platform
    platform: navigator.platform,
    
    // Hardware
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory,
    
    // Plugins (non disponibile in alcuni browser moderni)
    plugins: Array.from(navigator.plugins || []).map(p => p.name),
    
    // Fonts
    fonts: getInstalledFonts(),
    
    // Canvas fingerprint
    canvas: getCanvasFingerprint(),
    
    // WebGL
    webgl: getWebGLFingerprint(),
    
    // Audio
    audio: getAudioFingerprint(),
    
    // Touch support
    touchSupport: {
      maxTouchPoints: navigator.maxTouchPoints || 0,
      touchEvent: 'ontouchstart' in window,
      touchStart: 'ontouchstart' in window
    },
    
    // Storage
    cookies: navigator.cookieEnabled,
    localStorage: !!window.localStorage,
    sessionStorage: !!window.sessionStorage,
    indexedDB: !!window.indexedDB,
    
    // Automation detection
    webdriver: !!(navigator as any).webdriver,
    
    // Privacy
    doNotTrack: navigator.doNotTrack,
    
    // AdBlock
    adBlock: await detectAdBlock()
  };
  
  return fingerprint;
}

// Genera un hash semplificato del fingerprint
export function hashFingerprint(fingerprint: DeviceFingerprint): string {
  const simplified = {
    ua: fingerprint.userAgent,
    screen: `${fingerprint.screenResolution.width}x${fingerprint.screenResolution.height}`,
    timezone: fingerprint.timezone,
    language: fingerprint.language,
    platform: fingerprint.platform,
    canvas: fingerprint.canvas.substring(0, 50), // Solo parte del canvas
    webgl: `${fingerprint.webgl.vendor}-${fingerprint.webgl.renderer}`,
    fonts: fingerprint.fonts.length,
    plugins: fingerprint.plugins.length
  };
  
  // Crea una stringa univoca
  const str = JSON.stringify(simplified);
  
  // Genera hash semplice (in produzione usa una vera funzione hash)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

// Salva fingerprint in localStorage per confronti futuri
export function saveFingerprint(fingerprint: DeviceFingerprint): void {
  try {
    const hash = hashFingerprint(fingerprint);
    localStorage.setItem('device_fp', hash);
    localStorage.setItem('device_fp_time', new Date().toISOString());
  } catch (e) {
    console.error('Cannot save fingerprint:', e);
  }
}

// Controlla se il fingerprint è cambiato
export function hasFingerprintChanged(newFingerprint: DeviceFingerprint): boolean {
  try {
    const savedHash = localStorage.getItem('device_fp');
    if (!savedHash) return false;
    
    const newHash = hashFingerprint(newFingerprint);
    return savedHash !== newHash;
  } catch (e) {
    return false;
  }
}

// Esporta tutto
export default {
  generateDeviceFingerprint,
  hashFingerprint,
  saveFingerprint,
  hasFingerprintChanged
};
