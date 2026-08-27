================================================================
DOMAIN APPENDIX — APP / TOOL
================================================================

Paste after a role prompt when IDEA.DOMAIN=app (or product tool).

Defaults for Autonomous Lab apps:
- Still **static Pages**-friendly unless IDEA explicitly needs a backend
  (backends are Weak on this lab — prefer local-first).
- DOM or light component UI; pin stack in design.md.
- Tracking: PROGRESS + FEATURES + BUGS; CONTENT optional.
- ACCEPT: primary user flow works in Playwright; forms validate; no pageerror.
- Persist prefs via localStorage; document schema in shared/design.md.
- FORBIDDEN: rewriting BOILERPLATE_OWNED, cloud billing, OAuth unless human
  adds infra outside overnight scope.

App Feature slices = one user-visible flow (create/list/edit/export), not
theme-only churn.
