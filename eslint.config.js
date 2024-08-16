'use strict';

const {safeAlign} = require('eslint-plugin-putout/config');
const parser = require('@babel/eslint-parser');

module.exports = [
    ...safeAlign, {
        languageOptions: {
            parser,
            parserOptions: {
                requireConfigFile: false,
            },
        },
    },
];
