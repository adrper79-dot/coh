#!/usr/bin/env node
/**
 * voice-lint.mjs — Voice / compliance lint for CypherOfHealing user-facing copy.
 *
 * Scans select files for blocked terms that risk overstepping the brand's
 * regulated-vertical guardrails. CoH is a barber-led restoration + healing
 * education brand; it MUST NOT make medical-efficacy, FDA, HIPAA, or
 * insurance-billing claims through user-facing copy.
 *
 * Categories (case-insensitive regex):
 *   HIGH — medical efficacy claims, HIPAA / regulated language
 *   MED  — guaranteed-outcome marketing language
 *
 * Allowlist:
 *   Add a same-line comment `<!-- voice-lint-ignore: <word> -->` to skip
 *   matches of <word> on that line. Use sparingly and only when the term
 *   is clearly non-claimative (e.g. quoting an external source, or appearing
 *   in a disclaimer that explicitly disclaims it).
 *
 * Usage:
 *   node scripts/voice-lint.mjs           # MED is warning-only
 *   node scripts/voice-lint.mjs --strict  # MED also fails
 *
 * Exit codes:
 *   0  no HIGH hits (and, if --strict, no MED hits)
 *   1  one or more failing hits
 *
 * No external deps — pure Node 20+ + built-ins.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const STRICT = process.argv.includes('--strict');
const TTY = process.stdout.isTTY;
const RED = TTY ? '\x1b[31m' : '';
const YEL = TTY ? '\x1b[33m' : '';
const DIM = TTY ? '\x1b[2m' : '';
const RST = TTY ? '\x1b[0m' : '';

// ——— Blocked-term rules ———
const RULES = [
  // HIGH — medical efficacy
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\b(cure|cures|cured|curing)\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\b(treat|treats|treated|treating)\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\b(diagnose|diagnoses|diagnosed|diagnosing)\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\bheals?\s+(disease|illness)\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\bFDA[\s-]approved\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\bclinically\s+proven\b/i },
  { sev: 'HIGH', cat: 'medical-efficacy', re: /\bmedical(ly)?\s+proven\b/i },
  // HIGH — HIPAA / regulated billing
  { sev: 'HIGH', cat: 'hipaa-regulated', re: /\bHIPAA\b/ },
  { sev: 'HIGH', cat: 'hipaa-regulated', re: /\binsurance\s+billing\b/i },
  { sev: 'HIGH', cat: 'hipaa-regulated', re: /\bcovered\s+by\s+(insurance|medicare|medicaid)\b/i },
  // MED — guaranteed outcome
  { sev: 'MED', cat: 'guaranteed-outcome', re: /\bguarantees?d?\b/i },
  { sev: 'MED', cat: 'guaranteed-outcome', re: /\b100%\s+(effective|results|success)\b/i },
  { sev: 'MED', cat: 'guaranteed-outcome', re: /\bproven\s+results\b/i },
  { sev: 'MED', cat: 'guaranteed-outcome', re: /\bmiracle\b/i },
];

// ——— File discovery ———
const TARGETS = [
  { kind: 'file', path: 'README.md' },
  { kind: 'file', path: 'web/index.html' },
  { kind: 'glob', dir: 'web/src/pages', ext: '.tsx' },
  { kind: 'glob', dir: 'web/src/components', ext: '.tsx' },
  { kind: 'file', path: 'src/utils/email.ts' },
  { kind: 'glob', dir: 'web/src/content', ext: '.md' },
];

function walk(dir, ext, acc = []) {
  let entries;
  try { entries = readdirSync(dir); } catch { return acc; }
  for (const name of entries) {
    const p = join(dir, name);
    let s;
    try { s = statSync(p); } catch { continue; }
    if (s.isDirectory()) walk(p, ext, acc);
    else if (s.isFile() && p.endsWith(ext)) acc.push(p);
  }
  return acc;
}

function resolveTargets() {
  const files = [];
  for (const t of TARGETS) {
    if (t.kind === 'file') {
      const abs = join(ROOT, t.path);
      try { if (statSync(abs).isFile()) files.push(abs); } catch { /* skip */ }
    } else {
      files.push(...walk(join(ROOT, t.dir), t.ext));
    }
  }
  return files;
}

// ——— Scanner ———
const IGNORE_RE = /<!--\s*voice-lint-ignore:\s*([^\s>][^>]*?)\s*-->/gi;

function scanFile(absPath) {
  const rel = relative(ROOT, absPath).split(sep).join('/');
  let text;
  try { text = readFileSync(absPath, 'utf8'); } catch { return []; }
  const lines = text.split(/\r?\n/);
  const hits = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const ignoreWords = new Set();
    let m;
    IGNORE_RE.lastIndex = 0;
    while ((m = IGNORE_RE.exec(line))) ignoreWords.add(m[1].trim().toLowerCase());
    for (const rule of RULES) {
      const re = new RegExp(rule.re.source, rule.re.flags.includes('g') ? rule.re.flags : rule.re.flags + 'g');
      let mm;
      while ((mm = re.exec(line))) {
        const matched = mm[0];
        if (ignoreWords.has(matched.toLowerCase())) continue;
        hits.push({ file: rel, line: i + 1, sev: rule.sev, cat: rule.cat, match: matched });
      }
    }
  }
  return hits;
}

// ——— Main ———
const files = resolveTargets();
const allHits = [];
for (const f of files) allHits.push(...scanFile(f));

const byCat = {};
let highCount = 0;
let medCount = 0;
for (const h of allHits) {
  byCat[h.cat] = (byCat[h.cat] || 0) + 1;
  if (h.sev === 'HIGH') highCount++;
  else if (h.sev === 'MED') medCount++;
}

for (const h of allHits) {
  const color = h.sev === 'HIGH' ? RED : YEL;
  process.stdout.write(`${DIM}${h.file}:${h.line}${RST} — ${color}${h.sev}${RST} ${h.cat} — "${h.match}"\n`);
}

process.stdout.write(`\nvoice-lint: scanned ${files.length} files, ${allHits.length} hits ` +
  `(${RED}${highCount} HIGH${RST}, ${YEL}${medCount} MED${RST})\n`);
if (Object.keys(byCat).length) {
  process.stdout.write('by category: ' + Object.entries(byCat).map(([k, v]) => `${k}=${v}`).join(', ') + '\n');
}

const fail = highCount > 0 || (STRICT && medCount > 0);
process.exit(fail ? 1 : 0);
