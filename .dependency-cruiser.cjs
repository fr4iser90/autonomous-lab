/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular imports make overnight refactors brittle.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      comment: 'Orphans are OK for toys; runs should wire modules. Warn only.',
      from: { orphan: true, pathNot: ['(^|/)index\\.[jt]sx?$', '\\.spec\\.[jt]sx?$'] },
      to: {},
    },
    {
      name: 'ui-not-to-raw-data-deep',
      severity: 'warn',
      comment:
        'Preferred layering once a run grows folders: ui/app → systems/services → data/lib. Soft warn until folders exist.',
      from: { path: '^src/ui|^src/app' },
      to: { path: '^src/data' },
    },
    {
      name: 'not-to-dev-dep',
      severity: 'error',
      comment: 'Runtime src must not import packages marked as devDependencies.',
      from: { path: '^src', pathNot: ['\\.spec\\.[jt]sx?$', '\\.test\\.[jt]sx?$'] },
      to: { dependencyTypes: ['npm-dev'] },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      text: { highlightFocused: true },
    },
  },
}
