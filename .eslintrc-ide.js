'use strict';

const eslintConfig = require('./.eslintrc');

module.exports = {
    ...eslintConfig,
    extends: [
        ...eslintConfig.extends,
        'plugin:putout/ide',
    ],
};
