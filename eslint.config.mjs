import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

const eslintConfig = defineConfig([
  ...nextVitals,

  prettierRecommended,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'prettier/prettier': 'off',
      'react/react-in-jsx-scope': 'off',

      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off',
    },
  },
]);

export default eslintConfig;
