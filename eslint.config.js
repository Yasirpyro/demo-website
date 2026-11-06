import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['node_modules/**', 'dist/**', '.agents/**', '.tools/**', '.cache/**', 'playwright-report/**', 'test-results/**', 'skill-observations/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { files: ['src/**/*.{ts,tsx}'], plugins: { 'react-hooks': hooks, 'react-refresh': refresh }, rules: { ...hooks.configs.recommended.rules, 'react-refresh/only-export-components': ['error', { allowConstantExport: true }] } },
);
