'use strict';

const write = require('../write');

module.exports = async (outerPath, innerPath) => {
    await write(outerPath, innerPath, null, {
        remove: true,
    });
};

