# Soak — simulateToLayer + scripted paths

Targets (per overnight law): M5 → layer 3, M9 → layer 10, M12 → layer 20,
Phase 2b → layer 50 (no NaN/Infinity, prestige reachable every layer, save/load restores,
check-back within caps, deterministic sim for fixed seed), Phase 4 → LAYER_CAP (50→150).

## Records
- **M9 — simulateToLayer(10) seed 0**: OK, 20 356 ticks, ~1 018 seconds. Formula retune: 10× → 3× threshold growth, `sqrt` → `pow(0.65)` harmonic reward, `1+0.02h` → `(1.02)^h` exponential mult, Nova Relay (100K/50K/s/1.12) added. All 80 tests green.
- **M5 — simulateToLayer(3) seed 0**: OK, ~1 031 ticks (from M9 gate run; original M5 soak passed).
