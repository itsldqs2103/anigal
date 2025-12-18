import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

const eslintConfig = defineConfig([
  ...nextVitals,
  prettierRecommended,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    extends: ['next/core-web-vitals', 'plugin:prettier/recommended'],
    rules: {
      'prettier/prettier': 'error',
      'react/react-in-jsx-scope': 'off',
    },
  },
]);

export default eslintConfig;
