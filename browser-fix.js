// ===================================================
// COPIA E INCOLLA QUESTO NELLA CONSOLE DEL BROWSER
// ===================================================

console.log('%c🧹 PULIZIA COMPLETA IN CORSO...', 'color: yellow; font-size: 16px; font-weight: bold');

// 1. Pulisci tutto
localStorage.clear();
sessionStorage.clear();
console.log('✅ localStorage e sessionStorage puliti');

// 2. Verifica che sia tutto vuoto
console.log('\n📦 Stato localStorage:');
console.log('Token:', localStorage.getItem('token') || '(vuoto)');
console.log('User:', localStorage.getItem('user') || '(vuoto)');

// 3. Funzione per testare il login
async function testLoginInBrowser() {
  console.log('\n%c🔐 TEST LOGIN CON CREDENZIALI ERRATE', 'color: orange; font-size: 14px; font-weight: bold');
  
  const testData = {
    email: 'test@nonregistrato.com',
    password: 'password123'
  };
  
  console.log('Email:', testData.email);
  console.log('Password:', testData.password);
  
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('%c⚠️ PROBLEMA RILEVATO!', 'color: red; font-size: 16px; font-weight: bold');
      console.log('Il server ha accettato credenziali non valide!');
      console.log('Response:', data);
    } else {
      console.log('%c✅ TUTTO OK!', 'color: green; font-size: 16px; font-weight: bold');
      console.log('Il server ha correttamente rifiutato le credenziali');
      console.log('Errore ricevuto:', data.error);
    }
  } catch (error) {
    console.error('Errore nel test:', error);
  }
}

// 4. Istruzioni
console.log('\n%c📋 ISTRUZIONI:', 'color: cyan; font-size: 14px; font-weight: bold');
console.log('1. I dati sono stati puliti');
console.log('2. Digita: testLoginInBrowser() e premi ENTER per testare il login');
console.log('3. Poi vai su /login e prova ad accedere manualmente');
console.log('\nSe ancora accede con credenziali errate, il problema è nel frontend');

// Rendi la funzione disponibile globalmente
window.testLoginInBrowser = testLoginInBrowser;
