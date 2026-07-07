## Summary

<!-- Brief description of what this PR changes and why. -->

## Type of change

- [ ] 🐛 Bug fix (non-breaking)
- [ ] 🔒 Security fix (non-breaking)
- [ ] ♻️ Refactor (non-breaking)
- [ ] 🚀 New feature (non-breaking)
- [ ] 💥 Breaking change (requires migration / coordination)
- [ ] 📚 Documentation
- [ ] 🧪 Test
- [ ] 🔧 Tooling / CI

## Phase

- [ ] Phase 0 — Safety Net
- [ ] Phase 1 — Critical Security
- [ ] Phase 2 — Database Schema
- [ ] Phase 3 — Backend Hardening
- [ ] Phase 4 — Next.js Modernization
- [ ] Phase 5 — React Engineering
- [ ] Phase 6 — TypeScript Hardening
- [ ] Phase 7 — Performance
- [ ] Phase 8 — Accessibility
- [ ] Phase 9 — Styling
- [ ] Phase 10 — SEO
- [ ] Phase 11 — Code Quality
- [ ] Phase 12 — Testing
- [ ] Phase 13 — E2E
- [ ] Phase 14 — DevOps
- [ ] Phase 15 — Documentation
- [ ] Phase 16 — Final Verification

## Verification

- [ ] `bun run lint` passes (0 errors, 0 warnings)
- [ ] `bunx tsc --noEmit` passes (0 errors)
- [ ] `bun run build` passes
- [ ] No new `console.log` introduced
- [ ] No new `any` type introduced
- [ ] No new inline `style={{}}` introduced
- [ ] No new `@ts-ignore` / `as any` introduced
- [ ] Tests added/updated for new behavior (if applicable)
- [ ] **Per-file verification rubric attached**

## Breaking change checklist (only if checked above)

- [ ] Database migration included and tested on staging
- [ ] Environment variables added to `.env.example`
- [ ] Existing sessions invalidated (if auth flow changed)
- [ ] Public API contracts preserved or versioned
- [ ] Documentation updated

## Per-file verification rubric

For every file touched in this PR, fill in:

```
File: src/path/to/file.tsx

Improvements:
- ...

Remaining issues:
- ...

Scores (before → after):
| Dimension        | Before | After |
|------------------|-------:|------:|
| Architecture     | x/10   | x/10  |
| Performance      | x/10   | x/10  |
| Security         | x/10   | x/10  |
| TypeScript       | x/10   | x/10  |
| Maintainability  | x/10   | x/10  |
| Production Ready | x/10   | x/10  |
| Overall          | x/10   | x/10  |
```
