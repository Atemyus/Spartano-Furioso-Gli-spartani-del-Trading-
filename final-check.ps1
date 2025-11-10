# Script di verifica finale del sistema di autenticazione

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   VERIFICA FINALE SISTEMA AUTENTICAZIONE" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

# 1. Test backend con credenziali errate
Write-Host "1️⃣ TEST BACKEND - Login con credenziali errate:" -ForegroundColor Green
$testBody = @{
    email = "utente.non.esistente@test.com"
    password = "password123456"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -ErrorAction Stop
    
    Write-Host "   ❌ ERRORE: Il login è riuscito!" -ForegroundColor Red
    Write-Host "   Questo NON dovrebbe succedere!" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    if ($errorResponse.error -eq "Credenziali non valide") {
        Write-Host "   ✅ CORRETTO: Backend rifiuta credenziali errate" -ForegroundColor Green
        Write-Host "   Messaggio: $($errorResponse.error)" -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️ Errore inaspettato: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n2️⃣ MODIFICHE APPLICATE:" -ForegroundColor Green
Write-Host "   ✅ Rimossi dati mock (Mario Rossi) dalla Dashboard" -ForegroundColor White
Write-Host "   ✅ Rimossi trial e subscription fake" -ForegroundColor White
Write-Host "   ✅ Aggiunto controllo token reale" -ForegroundColor White
Write-Host "   ✅ Aggiunto ProtectedRoute per Dashboard" -ForegroundColor White
Write-Host "   ✅ Implementata validazione completa nel Login" -ForegroundColor White

Write-Host "`n3️⃣ COSA FARE ORA:" -ForegroundColor Green
Write-Host "   1. Apri il browser su: " -NoNewline
Write-Host "http://localhost:5174/auth-debug" -ForegroundColor Cyan
Write-Host "   2. Clicca 'Cancella TUTTO' nella pagina" -ForegroundColor White
Write-Host "   3. Vai su: " -NoNewline
Write-Host "http://localhost:5174/login" -ForegroundColor Cyan
Write-Host "   4. Prova ad accedere con email/password casuali" -ForegroundColor White

Write-Host "`n4️⃣ RISULTATO ATTESO:" -ForegroundColor Green
Write-Host "   ❌ Con credenziali errate → " -NoNewline -ForegroundColor White
Write-Host "'Credenziali non valide'" -ForegroundColor Red
Write-Host "   ❌ Senza registrazione → " -NoNewline -ForegroundColor White
Write-Host "NON deve accedere" -ForegroundColor Red
Write-Host "   ✅ Solo utente registrato → " -NoNewline -ForegroundColor White
Write-Host "Accesso consentito" -ForegroundColor Green

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "         SISTEMA PRONTO PER IL TEST!" -ForegroundColor Yellow
Write-Host "============================================`n" -ForegroundColor Cyan

# Apri automaticamente le pagine
Write-Host "Apertura automatica delle pagine di test..." -ForegroundColor Magenta
Start-Sleep -Seconds 2
Start-Process "http://localhost:5174/auth-debug"
Start-Sleep -Seconds 1
Write-Host "`n✨ Tutto pronto! Segui le istruzioni sopra." -ForegroundColor Green
