// https://docs.expo.dev/guides/using-eslint/
module.exports = {
  extends: 'expo',
  ignorePatterns: ['dist/**', 'node_modules/**', '.expo/**', 'web-build/**', 'src/screens/**', 'App.tsx'],
  rules: {
    'react-hooks/set-state-in-effect': 'off',
    'react-hooks/refs': 'off',
    'react-hooks/purity': 'off'
  }
};
