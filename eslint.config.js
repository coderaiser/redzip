'use strict';

const {defineConfig} = require('eslint/config');
const {safeAlign} = require('eslint-plugin-putout');
const parser = require('@babel/eslint-parser');

module.exports = defineConfig([
    safeAlign, {
        languageOptions: {
            parser,
            parserOptions: {
                requireConfigFile: false,
            },
        },
    },
]);
