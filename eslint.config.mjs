import js from '@eslint/js'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default [
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Ignore intentionally-unused catch bindings.
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
]
