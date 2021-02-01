'use strict';

const {write} = require('..');

module.exports = async (outerPath, innerPath) => {
    await write(outerPath, innerPath, null, {
        remove: true,
    });
};

