const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'turbo'],
  plugins: ['only-warn', 'simple-import-sort'],
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
  },
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
    'dist/',
  ],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  overrides: [
    {
      files: ['*.js?(x)', '*.ts?(x)'],
    },
  ],
};
