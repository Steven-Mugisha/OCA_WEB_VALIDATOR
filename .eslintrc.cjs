module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: 'standard',
  overrides: [
    {
      files: ['*.js', '*.mjs'],
      rules: {
        semi: ['error', 'always'],
        indent: ['error', 4]
      }
    },
    {
      env: {
        node: true
      },
      files: [
        '.eslintrc.{cjs}'
      ],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {},
  plugins: ['jest'],
  ignorePatterns: ['*.eslintrc.js']
};
