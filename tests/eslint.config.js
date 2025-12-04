import js from '@eslint/js';

export default [
    js.configs.recommended,
    {
        rules: {
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
            'no-console': 'off' // Allow console in tests
        },
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                'process': 'readonly',
                'console': 'readonly',
                '__dirname': 'readonly',
                '__filename': 'readonly',
                'Buffer': 'readonly',
                'URL': 'readonly',
                'URLSearchParams': 'readonly'
            }
        }
    }
];
