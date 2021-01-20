'use strict';

const readZip = require('./read');
const readZipSize = require('./read-size');

module.exports.read = async (outerPath, innerPath, options) => {
    return await readZip(outerPath, innerPath, options);
};

module.exports.readSize = async (outerPath, innerPath, options) => {
    return await readZipSize(outerPath, innerPath, options);
};

