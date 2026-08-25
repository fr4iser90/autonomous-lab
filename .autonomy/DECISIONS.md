# Decisions

Boilerplate defaults (stable across runs):

- **Hosting:** GitHub Pages from `main`; Vite `base` = `/autonomous-lab/`.
- **Branches:** `baseline` frozen boilerplate; `agent/<run-id>` for work; never push `main`/`baseline` from the agent.
- **Gates:** `npm run gate` (test + build) is the mechanical Definition of Done.
- **Prompts:** Genre/engine come from the harness prompt for the run — not from `baseline` defaults.

Run-specific decisions (append below at autonomy start / when first chosen):

- *(none yet)*
