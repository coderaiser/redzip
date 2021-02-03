'use strict';

const readZip = require('./read');
const readZipSize = require('./read-size');
const writeZip = require('./write');
const removeZip = require('./remove');

module.exports.read = async (outerPath, innerPath, options) => {
    return await readZip(outerPath, innerPath, options);
};

module.exports.readSize = async (outerPath, innerPath, options) => {
    return await readZipSize(outerPath, innerPath, options);
};

module.exports.write = async (outerPath, innerPath, stream, options) => {
    return await writeZip(outerPath, innerPath, stream, options);
};

module.exports.remove = async (outerPath, innerPath, stream, options) => {
    return await removeZip(outerPath, innerPath);
};

