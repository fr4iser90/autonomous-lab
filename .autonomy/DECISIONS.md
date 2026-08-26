<!-- BOILERPLATE_PLACEHOLDER / LEGACY_OPTIONAL: pin engine choices in PROGRESS.md or FEATURES.md. See BOILERPLATE.md -->

# Decisions

Boilerplate defaults (stable — do not fight these from the agent):

- **Hosting:** GitHub Pages from `main`; Vite `base` = `/autonomous-lab/`.
- **Branches:** `baseline` frozen boilerplate; `agent/<run-id>` for work; never push `main`/`baseline` from the agent.
- **Gates:** `npm run gate` (test + build) is the mechanical Definition of Done.
- **Live publish:** Push to `agent/*` opens a PR; green CI `gate` automerges (squash) into `main` → Pages.
- **Ownership:** `BOILERPLATE.md` allow/deny lists.
- **Genre:** Comes from the active run objective only — not from `baseline` toys.

Run-specific decisions (append below when first chosen, or put them in PROGRESS/FEATURES):

- *(none yet)*
