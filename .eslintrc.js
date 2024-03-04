export default {
  env: {
    browser: true,
    es2021: true
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
        '.eslintrc.{js,cjs}'
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
