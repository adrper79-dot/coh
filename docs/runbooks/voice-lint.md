# Voice Lint Runbook

`scripts/voice-lint.mjs` scans user-facing copy for blocked terms that risk
overstepping CypherOfHealing's regulated-vertical guardrails. CoH operates in
the healing / wellness adjacency to medical, mental-health, and insurance-
regulated language — the brand voice must stay clearly **restorative,
reflective, and educational** without claiming clinical outcomes.

## What it lints, and why

| Category | Severity | Examples | Why |
|---|---|---|---|
| medical-efficacy | HIGH | `cure`, `treat`, `diagnose`, `heals disease`, `FDA approved`, `clinically proven`, `medically proven` | Implies clinical / medical efficacy. CoH is not licensed to make these claims and disclaims them on every page. |
| hipaa-regulated | HIGH | `HIPAA`, `insurance billing`, `covered by insurance / medicare / medicaid` | CoH is not a HIPAA covered entity and does not bill insurance. Claiming otherwise creates regulatory exposure. |
| guaranteed-outcome | MED | `guarantee(d)`, `100% effective/results/success`, `proven results`, `miracle` | Marketing language that promises specific outcomes. FTC-adjacent risk, plus off-brand for a reflective practice. |

HIGH hits fail CI (exit `1`). MED hits are warnings by default; run with
`--strict` to make them fail too.

## What it scans

- `README.md` (repo root, public-facing)
- `web/index.html`
- `web/src/pages/**/*.tsx`
- `web/src/components/**/*.tsx`
- `src/utils/email.ts` (customer-facing email templates)
- `web/src/content/**/*.md` (if present)

Scanning is line-based regex against best-effort plain text — it will catch
JSX text content, JSON string values, HTML, and Markdown, but it is not an AST
parser. Perfect is the enemy of good here.

## Running it

```bash
node scripts/voice-lint.mjs           # MED warning-only — fails on HIGH
node scripts/voice-lint.mjs --strict  # MED also fails
npm run voice-lint                    # same as the first form
```

In CI, `.github/workflows/voice-lint.yml` runs on every PR against `main`.

## Allowlisting a specific occurrence

If a blocked term must appear (e.g. a disclaimer that explicitly disavows it),
add a same-line HTML comment:

```html
<p>This service is not <!-- voice-lint-ignore: HIPAA --> HIPAA-regulated.</p>
```

The allowlist is **per-line, per-word**. Use sparingly. In TSX text nodes the
HTML-comment form will render as literal text — prefer rewriting the copy.

## When to update the blocked-term list

Update `RULES` in `scripts/voice-lint.mjs` when:

- Legal, marketing, or CMS leadership flags a new pattern to avoid
- A new regulated vertical is added (e.g. supplements → FTC dietary-claim terms)
- A real-world complaint or audit surfaces a gap
- A new term enters the cultural vocabulary that risks misreading as a claim

Keep the script under ~200 lines. If it grows past that, the rules belong in a
separate JSON / YAML file loaded by the script.

## What this is **not**

- Not legal advice
- Not a HIPAA compliance audit
- Not an FDA approval check
- Not a substitute for human review by legal / compliance before launching new
  campaigns or campaign-scale copy changes

It is a cheap pre-commit guardrail that catches common slips before they ship.
