#!/usr/bin/env node
// Encrypts medical_tracker_src.html → index.html
// Usage: node encrypt.js <passcode>
//        node encrypt.js          (will prompt)

const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');

const SRC  = 'medical_tracker_src.html';
const DEST = 'index.html';

// ── Extract sections from source ────────────────────────────────────────────

function extractSrc() {
  const html = fs.readFileSync(SRC, 'utf8');

  const jsxMatch = html.match(/<script[^>]+id="app-jsx"[^>]*>([\s\S]*?)<\/script>/);
  if (!jsxMatch) throw new Error('Could not find #app-jsx block in ' + SRC);
  const jsx = jsxMatch[1];

  const modMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
  if (!modMatch) throw new Error('Could not find module script in ' + SRC);
  const module = modMatch[1];

  return JSON.stringify({ jsx, module });
}

// ── Encrypt ──────────────────────────────────────────────────────────────────
// Format: salt(16) + iv(12) + tag(16) + ciphertext  → base64
// Must match the layout expected by index.html's tryDecrypt()

function encryptPayload(passcode, plaintext) {
  const salt = crypto.randomBytes(16);
  const iv   = crypto.randomBytes(12);
  const key  = crypto.pbkdf2Sync(passcode, salt, 100000, 32, 'sha256');

  const cipher     = crypto.createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag        = cipher.getAuthTag(); // 16 bytes

  return Buffer.concat([salt, iv, tag, ciphertext]).toString('base64');
}

// ── Patch index.html ─────────────────────────────────────────────────────────

function patchIndex(b64) {
  let html = fs.readFileSync(DEST, 'utf8');
  html = html.replace(
    /(<script[^>]+id="encrypted-payload"[^>]*>)[^<]*(<\/script>)/,
    `$1\n${b64}\n$2`
  );
  fs.writeFileSync(DEST, html, 'utf8');
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const passArg = process.argv[2];

  const passcode = await (passArg
    ? Promise.resolve(passArg)
    : new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('Passcode: ', ans => { rl.close(); resolve(ans.trim()); });
      })
  );

  if (!passcode) { console.error('No passcode provided.'); process.exit(1); }

  console.log('Extracting source…');
  const plaintext = extractSrc();

  console.log('Encrypting…');
  const b64 = encryptPayload(passcode, plaintext);

  console.log('Patching index.html…');
  patchIndex(b64);

  console.log('Done. index.html updated.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
