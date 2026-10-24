/**
 * Clipword waitlist: receives the landing-page form and appends a row to this Sheet.
 * Paste into Extensions → Apps Script of the sign-up Sheet, then deploy as a web app
 * (Execute as: Me, Who has access: Anyone). Setup steps are in the README.
 */

const SHEET_NAME = 'Signups';
const HEADER = ['Signed up', 'Email', 'Languages', 'Source'];
const LANGUAGES = ['de', 'ja', 'fr', 'es', 'ko', 'other'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  const p = (e && e.parameter) || {};

  // Honeypot filled in: a bot. Pretend it worked so it doesn't retry.
  if (p.website) return reply({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return reply({ ok: false, error: 'email' });

  const languages = String(p.languages || '')
    .split(',')
    .map((code) => code.trim())
    .filter((code) => LANGUAGES.indexOf(code) !== -1);
  const source = String(p.source || '').replace(/[^\w.-]/g, '').slice(0, 40);

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = getSheet();
    const last = sheet.getLastRow();
    if (last > 1) {
      const known = sheet.getRange(2, 2, last - 1, 1).getValues().map((row) => String(row[0]).replace(/^'/, ''));
      if (known.indexOf(email) !== -1) return reply({ ok: true, already: true });
    }
    // A leading ' stops Sheets from treating text that starts with = + - @ as a formula.
    sheet.appendRow([new Date(), safeCell(email), languages.join(', '), safeCell(source)]);
    return reply({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

// Opening the web app URL in a browser shows this, so you can check the deployment is live.
function doGet() {
  return reply({ ok: true, service: 'clipword-waitlist' });
}

function getSheet() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADER);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function safeCell(text) {
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function reply(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
