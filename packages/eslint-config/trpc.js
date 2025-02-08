const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [require.resolve('@vercel/style-guide/eslint/typescript'), 'prettier', 'turbo'],
  env: {
    node: true,
    browser: false,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['only-warn', 'simple-import-sort', '@typescript-eslint'],
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    '.*.js',
    'node_modules/',
  ],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    // Ignore variable start with underscored @typescript-eslint/no-unused-vars
    '@typescript-eslint/no-unused-vars': [
      'warn', // Or 'error' based on your preference
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrors: 'all', // Enable handling for catch parameters
        caughtErrorsIgnorePattern: '^_', // Ignore unused variables in catch if prefixed with _
      },
    ],
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  overrides: [{ files: ['*.js?(x)', '*.ts?(x)'] }],
};
