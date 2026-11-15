import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', '.cache/**', 'docs/**', 'store/**', 'public/**'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.webextensions, ...globals.serviceworker },
    },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "ImportDeclaration[source.value='react'] > ImportSpecifier[imported.name=/^(useCallback|useMemo|memo)$/]",
          message: 'The React Compiler memoizes automatically; use plain functions and values.',
        },
      ],
      'no-restricted-properties': [
        'error',
        ...['useCallback', 'useMemo', 'memo'].map((property) => ({
          object: 'React',
          property,
          message: 'The React Compiler memoizes automatically; use plain functions and values.',
        })),
      ],
    },
  },

  {
    files: ['scripts/**/*.{js,mjs,ts}', 'e2e/**/*.{js,mjs}', '*.config.{js,mjs,ts}'],
    languageOptions: { globals: { ...globals.node, ...globals.browser, ...globals.webextensions } },
  },

  {
    files: ['e2e/**/*.{js,mjs}'],
    languageOptions: { globals: { fp: 'readonly' } },
  },

  {
    files: ['src/shared/ui/*-*.tsx', 'src/shared/ui/{badge,button,form,tabs,toggle}.tsx', 'src/**/index.ts'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },

  {
    plugins: { import: importPlugin, 'unused-imports': unusedImports },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'unused-imports/no-unused-imports': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object', 'type'],
          pathGroups: [
            { pattern: '@/**', group: 'internal' },
            { pattern: '*.css', group: 'index', position: 'after', patternOptions: { matchBase: true } },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/newline-after-import': 'warn',
      'import/no-duplicates': 'warn',
    },
  },

  prettier
);
