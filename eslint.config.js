'use strict'

const js = require('@eslint/js')
const prettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')

module.exports = [
  {
    ignores: ['dist/'],
  },
  js.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'commonjs',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      strict: ['error', 'global'],
      // Preserve eslint 8's default: don't flag unused catch bindings.
      'no-unused-vars': ['error', { caughtErrors: 'none' }],
    },
  },
]
