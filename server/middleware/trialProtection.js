import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// File per tracciare gli abusi
const abuseLogPath = path.join(__dirname, '..', 'data', 'trial-abuse-log.json');
const deviceFingerprintsPath = path.join(__dirname, '..', 'data', 'device-fingerprints.json');

// Helper per leggere il log degli abusi
async function readAbuseLog() {
  try {
    const data = await fs.readFile(abuseLogPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {
        ipAddresses: {},
        deviceFingerprints: {},
        suspiciousPatterns: [],
        blockedEntities: []
      };
    }
    throw error;
  }
}

// Helper per salvare il log degli abusi
async function saveAbuseLog(log) {
  await fs.writeFile(abuseLogPath, JSON.stringify(log, null, 2));
}

// Helper per leggere i fingerprint dei dispositivi
async function readDeviceFingerprints() {
  try {
    const data = await fs.readFile(deviceFingerprintsPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Helper per salvare i fingerprint
async function saveDeviceFingerprints(fingerprints) {
  await fs.writeFile(deviceFingerprintsPath, JSON.stringify(fingerprints, null, 2));
}

// Genera un hash del device fingerprint
function generateDeviceHash(fingerprint) {
  const {
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    plugins,
    fonts,
    canvas
  } = fingerprint;

  const fingerprintString = JSON.stringify({
    userAgent,
    screenResolution,
    timezone,
    language,
    platform,
    plugins: plugins?.length || 0,
    fonts: fonts?.length || 0,
    canvas
  });

  return crypto.createHash('sha256').update(fingerprintString).digest('hex');
}

// Ottieni il vero IP dell'utente (considera proxy/CDN)
function getRealIP(req) {
  return req.headers['x-real-ip'] || 
         req.headers['x-forwarded-for']?.split(',')[0] || 
         req.connection.remoteAddress ||
         req.socket.remoteAddress;
}

// Ottieni l'IP range (per identificare stesso ISP/area)
function getIPRange(ip) {
  if (!ip) return null;
  
  // Per IPv4, prendi i primi 3 ottetti
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return parts.slice(0, 3).join('.');
  }
  
  // Per IPv6, prendi il prefisso
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':');
  }
  
  return ip;
}

// Controlla pattern sospetti
async function checkSuspiciousPatterns(email, ip, deviceFingerprint) {
  const suspiciousIndicators = [];
  
  // Pattern email sospetti
  const emailPatterns = [
    /\+\d+@/, // Email con alias numerici (user+1@gmail.com)
    /^[a-z]{1,2}\d{5,}@/, // Email con molti numeri
    /temp|trash|fake|test|disposable/i, // Email temporanee
    /@(guerrillamail|mailinator|10minutemail|tempmail|throwaway)/i // Domini temporanei noti
  ];
  
  for (const pattern of emailPatterns) {
    if (pattern.test(email)) {
      suspiciousIndicators.push({
        type: 'suspicious_email',
        pattern: pattern.toString(),
        value: email
      });
    }
  }
  
  // Controlla se l'IP è VPN/Proxy (lista base)
  const vpnRanges = [
    '104.28.', '172.67.', // Cloudflare
    '198.41.', '199.27.', // VPN comuni
    '45.32.', '45.76.', '45.77.' // Vultr/VPS
  ];
  
  const ipStart = ip?.substring(0, 7);
  if (vpnRanges.some(range => ip?.startsWith(range))) {
    suspiciousIndicators.push({
      type: 'vpn_detected',
      value: ip
    });
  }
  
  // Device fingerprint anomali
  if (deviceFingerprint) {
    // Browser headless detection
    if (deviceFingerprint.webdriver || 
        deviceFingerprint.plugins?.length === 0 ||
        !deviceFingerprint.languages?.length) {
      suspiciousIndicators.push({
        type: 'automated_browser',
        value: 'headless_or_automated'
      });
    }
    
    // Risoluzione schermo sospetta
    const { width, height } = deviceFingerprint.screenResolution || {};
    if (width === height || width < 800 || height < 600) {
      suspiciousIndicators.push({
        type: 'suspicious_screen',
        value: `${width}x${height}`
      });
    }
  }
  
  return suspiciousIndicators;
}

// Middleware principale per la protezione trial
export async function protectTrial(req, res, next) {
  try {
    const { email, deviceFingerprint } = req.body;
    const ip = getRealIP(req);
    const ipRange = getIPRange(ip);
    
    console.log(`🔍 Controllo trial per: ${email} da IP: ${ip}`);
    
    // Carica i log
    const abuseLog = await readAbuseLog();
    const fingerprints = await readDeviceFingerprints();
    
    // Genera hash del device se fornito
    let deviceHash = null;
    if (deviceFingerprint) {
      deviceHash = generateDeviceHash(deviceFingerprint);
    }
    
    // Controlla se l'entità è bloccata
    const blocked = abuseLog.blockedEntities.find(entity => 
      entity.ip === ip || 
      entity.ipRange === ipRange ||
      entity.deviceHash === deviceHash ||
      entity.email === email
    );
    
    if (blocked) {
      console.log(`🚫 Accesso bloccato per: ${email} - Motivo: ${blocked.reason}`);
      return res.status(403).json({
        error: 'Accesso negato',
        message: 'Il tuo account è stato sospeso per violazione dei termini di servizio. Contatta il supporto per maggiori informazioni.',
        code: 'TRIAL_ABUSE_BLOCKED'
      });
    }
    
    // Traccia l'IP
    if (!abuseLog.ipAddresses[ip]) {
      abuseLog.ipAddresses[ip] = {
        firstSeen: new Date().toISOString(),
        accounts: [],
        trialCount: 0
      };
    }
    
    // Aggiungi account all'IP se non presente
    if (!abuseLog.ipAddresses[ip].accounts.includes(email)) {
      abuseLog.ipAddresses[ip].accounts.push(email);
      abuseLog.ipAddresses[ip].lastSeen = new Date().toISOString();
    }
    
    // Traccia il device fingerprint
    if (deviceHash) {
      if (!abuseLog.deviceFingerprints[deviceHash]) {
        abuseLog.deviceFingerprints[deviceHash] = {
          firstSeen: new Date().toISOString(),
          accounts: [],
          trialCount: 0,
          fingerprint: deviceFingerprint
        };
      }
      
      if (!abuseLog.deviceFingerprints[deviceHash].accounts.includes(email)) {
        abuseLog.deviceFingerprints[deviceHash].accounts.push(email);
        abuseLog.deviceFingerprints[deviceHash].lastSeen = new Date().toISOString();
      }
      
      // Salva il fingerprint completo
      fingerprints[deviceHash] = {
        ...deviceFingerprint,
        email,
        ip,
        timestamp: new Date().toISOString()
      };
    }
    
    // Controlla limiti per IP
    const ipData = abuseLog.ipAddresses[ip];
    const MAX_ACCOUNTS_PER_IP = 3; // Max 3 account per IP
    const MAX_TRIALS_PER_IP = 2; // Max 2 trial per IP
    
    if (ipData.accounts.length > MAX_ACCOUNTS_PER_IP) {
      console.log(`⚠️ Troppi account dallo stesso IP: ${ip} (${ipData.accounts.length} account)`);
      
      // Aggiungi a sospetti
      abuseLog.suspiciousPatterns.push({
        type: 'multiple_accounts_same_ip',
        ip,
        accounts: ipData.accounts,
        timestamp: new Date().toISOString()
      });
      
      // Se supera di molto il limite, blocca
      if (ipData.accounts.length > MAX_ACCOUNTS_PER_IP + 2) {
        abuseLog.blockedEntities.push({
          ip,
          ipRange,
          reason: `Creati ${ipData.accounts.length} account dallo stesso IP`,
          timestamp: new Date().toISOString()
        });
        
        await saveAbuseLog(abuseLog);
        
        return res.status(403).json({
          error: 'Limite account superato',
          message: 'Hai superato il numero massimo di account consentiti per questo indirizzo IP.',
          code: 'IP_LIMIT_EXCEEDED'
        });
      }
    }
    
    // Controlla limiti per device
    if (deviceHash) {
      const deviceData = abuseLog.deviceFingerprints[deviceHash];
      const MAX_ACCOUNTS_PER_DEVICE = 2; // Max 2 account per dispositivo
      
      if (deviceData.accounts.length > MAX_ACCOUNTS_PER_DEVICE) {
        console.log(`⚠️ Troppi account dallo stesso dispositivo: ${deviceData.accounts.length} account`);
        
        // Aggiungi a sospetti
        abuseLog.suspiciousPatterns.push({
          type: 'multiple_accounts_same_device',
          deviceHash,
          accounts: deviceData.accounts,
          timestamp: new Date().toISOString()
        });
        
        // Blocca se supera il limite
        if (deviceData.accounts.length > MAX_ACCOUNTS_PER_DEVICE + 1) {
          abuseLog.blockedEntities.push({
            deviceHash,
            reason: `Creati ${deviceData.accounts.length} account dallo stesso dispositivo`,
            timestamp: new Date().toISOString()
          });
          
          await saveAbuseLog(abuseLog);
          
          return res.status(403).json({
            error: 'Limite dispositivo superato',
            message: 'Hai superato il numero massimo di account consentiti per questo dispositivo.',
            code: 'DEVICE_LIMIT_EXCEEDED'
          });
        }
      }
    }
    
    // Controlla pattern sospetti
    const suspiciousPatterns = await checkSuspiciousPatterns(email, ip, deviceFingerprint);
    if (suspiciousPatterns.length > 0) {
      console.log(`⚠️ Pattern sospetti rilevati:`, suspiciousPatterns);
      
      abuseLog.suspiciousPatterns.push({
        email,
        ip,
        patterns: suspiciousPatterns,
        timestamp: new Date().toISOString()
      });
      
      // Se troppi pattern sospetti, richiedi verifica aggiuntiva
      if (suspiciousPatterns.length >= 2) {
        req.requiresAdditionalVerification = true;
        req.suspiciousPatterns = suspiciousPatterns;
      }
    }
    
    // Salva i log aggiornati
    await saveAbuseLog(abuseLog);
    await saveDeviceFingerprints(fingerprints);
    
    // Aggiungi info al request per uso successivo
    req.trialProtection = {
      ip,
      ipRange,
      deviceHash,
      accountsFromIP: ipData.accounts.length,
      accountsFromDevice: deviceHash ? abuseLog.deviceFingerprints[deviceHash].accounts.length : 0,
      suspiciousPatterns
    };
    
    next();
  } catch (error) {
    console.error('Error in trial protection:', error);
    // In caso di errore, procedi ma logga
    next();
  }
}

// Middleware per incrementare il contatore trial quando viene attivato
export async function recordTrialActivation(email, ip, deviceHash) {
  try {
    const abuseLog = await readAbuseLog();
    
    // Incrementa contatore per IP
    if (abuseLog.ipAddresses[ip]) {
      abuseLog.ipAddresses[ip].trialCount++;
      abuseLog.ipAddresses[ip].lastTrialActivation = new Date().toISOString();
      
      // Se troppi trial dallo stesso IP, aggiungi ai sospetti
      if (abuseLog.ipAddresses[ip].trialCount > 2) {
        console.log(`🚨 Abuso trial rilevato - IP ${ip} ha attivato ${abuseLog.ipAddresses[ip].trialCount} trial`);
        
        abuseLog.suspiciousPatterns.push({
          type: 'excessive_trials_from_ip',
          ip,
          trialCount: abuseLog.ipAddresses[ip].trialCount,
          accounts: abuseLog.ipAddresses[ip].accounts,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Incrementa contatore per device
    if (deviceHash && abuseLog.deviceFingerprints[deviceHash]) {
      abuseLog.deviceFingerprints[deviceHash].trialCount++;
      abuseLog.deviceFingerprints[deviceHash].lastTrialActivation = new Date().toISOString();
      
      // Se troppi trial dallo stesso device
      if (abuseLog.deviceFingerprints[deviceHash].trialCount > 2) {
        console.log(`🚨 Abuso trial rilevato - Device ha attivato ${abuseLog.deviceFingerprints[deviceHash].trialCount} trial`);
        
        abuseLog.suspiciousPatterns.push({
          type: 'excessive_trials_from_device',
          deviceHash,
          trialCount: abuseLog.deviceFingerprints[deviceHash].trialCount,
          accounts: abuseLog.deviceFingerprints[deviceHash].accounts,
          timestamp: new Date().toISOString()
        });
      }
    }
    
    await saveAbuseLog(abuseLog);
  } catch (error) {
    console.error('Error recording trial activation:', error);
  }
}

// Funzione per ottenere report abusi (per admin)
export async function getAbuseReport() {
  try {
    const abuseLog = await readAbuseLog();
    
    // Calcola statistiche
    const stats = {
      totalIPs: Object.keys(abuseLog.ipAddresses).length,
      totalDevices: Object.keys(abuseLog.deviceFingerprints).length,
      suspiciousPatterns: abuseLog.suspiciousPatterns.length,
      blockedEntities: abuseLog.blockedEntities.length,
      
      // IP con più account
      multiAccountIPs: Object.entries(abuseLog.ipAddresses)
        .filter(([ip, data]) => data.accounts.length > 1)
        .map(([ip, data]) => ({
          ip,
          accounts: data.accounts,
          trialCount: data.trialCount
        }))
        .sort((a, b) => b.accounts.length - a.accounts.length),
      
      // Device con più account
      multiAccountDevices: Object.entries(abuseLog.deviceFingerprints)
        .filter(([hash, data]) => data.accounts.length > 1)
        .map(([hash, data]) => ({
          deviceHash: hash,
          accounts: data.accounts,
          trialCount: data.trialCount
        }))
        .sort((a, b) => b.accounts.length - a.accounts.length),
      
      // Pattern sospetti recenti
      recentSuspicious: abuseLog.suspiciousPatterns
        .slice(-10)
        .reverse()
    };
    
    return {
      stats,
      blockedEntities: abuseLog.blockedEntities,
      rawData: abuseLog
    };
  } catch (error) {
    console.error('Error generating abuse report:', error);
    return null;
  }
}

export default {
  protectTrial,
  recordTrialActivation,
  getAbuseReport
};
