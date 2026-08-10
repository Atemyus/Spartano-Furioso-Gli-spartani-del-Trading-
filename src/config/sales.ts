/**
 * Configurazione strategia di vendita.
 *
 * PRICE_ON_REQUEST = true  → i prezzi NON vengono mostrati: al loro posto compare
 *   "Prezzo riservato" e i pulsanti di acquisto diventano "Prenota una call".
 *   Il prezzo viene discusso direttamente in call col fondatore.
 *
 * Per riattivare i prezzi pubblici in futuro: metti false.
 */
export const PRICE_ON_REQUEST = true;

/** Dove mandare chi clicca "Prenota una call" (widget Calendly del fondatore). */
export const CALL_BOOKING_URL = 'https://calendly.com/nexoralab/discovery-call';

/** Testo mostrato al posto del prezzo. */
export const PRICE_ON_REQUEST_LABEL = 'Prezzo riservato';
export const CALL_CTA_LABEL = 'Prenota una call';
