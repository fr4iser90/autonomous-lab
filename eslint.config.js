import eslint from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'

/** Boilerplate lint — keep mild so overnight runs can grow src/ without fighting style nits. */
export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'demo/**',
      'node_modules/**',
      'lab/**',
      '.output/**',
      '**/.output/**',
      '*.config.js',
      '*.config.cjs',
      '.dependency-cruiser.cjs',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx,js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'off',
    },
  },
)
