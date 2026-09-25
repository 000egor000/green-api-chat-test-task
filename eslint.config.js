import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const LAYERS = ['api', 'components', 'constants', 'hooks', 'store', 'utils'];

export default tseslint.config(
  { ignores: ['dist', 'test-results', 'playwright-report'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: LAYERS.map((layer) => `**/${layer}/*`),
              message: 'Импортируйте слой через его публичный API (index.ts), а не по внутреннему пути.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['e2e/**/*.ts', '*.config.ts'],
    languageOptions: { globals: globals.node },
  },
);
